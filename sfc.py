# Script para descargar información de bancos de la Superfinanciera y mostrar alertas

import bs4, requests, zipfile, os, re

# Parte para descargar archivos. Revisa cuáles hay en la página y descarga los que no hay en la carpeta

direccion = 'https://www.superfinanciera.gov.co/publicacion/10084375'
direccion_base = 'http://www.superfinanciera.gov.co'
directorio_archivos = 'C:\\Users\\Juan\\Documents\\sfc\\base'

pagina = requests.get(direccion) # descarga el HTML

pagina.raise_for_status() # check errores

soup = bs4.BeautifulSoup(pagina.text, 'html.parser') # parse HTML

links = [x.attrs['href'] for x in soup.select('.pub li a')] # extrae links de acuerdo al DOM de la página y crea array con links a archivo (.zip), sin dirección base

archivos_actuales = [x[:x.rfind('.')] for x in os.listdir(directorio_archivos)] # lista de archivos en directorio_archivos, sin extensión

links_dict = {re.search('00[0-9]*n',x)[0]:x for x in links} # diccionario de: (nombre de archivo sin extensión : link para descargar)

numero_links = len(links)

links_descargar = [x for x in links_dict.keys() if x not in archivos_actuales]

os.chdir(directorio_archivos)

lista_archivos = []

aldia = False

if len(links_descargar) > 0:
    print('Descargando', str(numero_links - len(archivos_actuales)), 'archivos' if len(links_descargar) > 1 else 'archivo', end = '')
    for x in links_descargar:
        # baja los archivos a directorio_archivos, extrae el zip,
        # anota el nombre del .xls en lista_archivos y borra el zip
        temp_bytes = requests.get(direccion_base + links_dict[x])
        temp_bytes.raise_for_status()
        temp_zip = open(directorio_archivos + x[-15:], 'wb')
        temp_zip.write(temp_bytes.content)
        z = zipfile.ZipFile(temp_zip.name, 'r')
        z.extractall(path = directorio_archivos)
        temp_zip.close()
        lista_archivos.append(z.namelist()[0])
        z.close()
        os.remove(temp_zip.name)
        print('.', end = '')
        if x == links_descargar[len(links_descargar) - 1]: print('ok')
else:
    print('Archivos al día')
    aldia = True
    input("")

#del archivos_actuales, direccion, direccion_base, links, links_descargar, links_dict, numero_links

import xlrd, datetime, json, copy, base64

def extension(nombre_archivo): # devuelve la extensión de un nombre de archivo
    return nombre_archivo[nombre_archivo.find('.'):]

def arreglar_fecha(nombre_archivo): # arregla las fechas de 'ddmmaaaa.xls' a 'aaaammdd'
    x1 = nombre_archivo[2:nombre_archivo.find('.')-1]
    x2 = x1[-4:] + x1[2:4] + x1[:2]
    return x2

def arreglar_nombres(nuevo, obj):
    '''
    busca nuevo en nombres_global (por ejemplo '1- BANCO DE BOGOTA'),
    si no hay ninguna key que comience por '1-' en obj la crea con un objeto vacío
    y crea los array de los datos como un array vacío,
    si la hay pero el nombre es diferente (p.e. '7- BANCOLOMBIA' vs. '7- BANCOLOMBIA S.A.'),
    copia el objeto a una nueva key con el nombre nuevo.
    no devuelve nada, cambia obj in place

    '''
    numero_nuevo = nuevo[:nuevo.find('-')]
    keys = {k[:k.find('-')]: k for k in obj.keys()}
    if numero_nuevo not in keys.keys():
        obj[nuevo] = {}
        obj[nuevo]['fechas'] = []
        obj[nuevo]['cartera_total'] = []
        obj[nuevo]['cartera_A'] = []
        obj[nuevo]['ICC'] = []
        obj[nuevo]['resultados'] = []
    else:
        if nuevo != keys[numero_nuevo]:
            obj[nuevo] = obj.pop(keys[numero_nuevo])

def fecha_datetime(texto): # recibe 00ddmmaaaa.xls y devuelve objeto datetime
    return datetime.date(year = int(texto[-4:]), month = int(texto[2:4]), day = int(texto[:2]))

if not aldia:
    directorio_archivos = 'C:\\Users\\Juan\\Documents\\sfc\\base\\'
    directorio_txt = 'C:\\Users\\Juan\\Documents\\sfc\\'

    lista_archivos = [x for x in os.listdir(directorio_archivos) if extension(x)=='.xls']
    numero_archivos = len(lista_archivos)

    if numero_archivos:
        print('Leyendo', numero_archivos, 'archivos' if numero_archivos > 1 else 'archivo')

        lista_archivos.sort(key = arreglar_fecha)

    contador_archivos = 0

    j = {}

    for nombre_archivo in lista_archivos:
        excel = xlrd.open_workbook(directorio_archivos + nombre_archivo)
        hoja = excel.sheets()[0]
        filadatos = 0
        fecha_str = arreglar_fecha(nombre_archivo)
        for fila in range(15): # busca en las primeras 15 filas 'ACTIVO' para saber en cual comienzan los datos, dado que cambia
            if hoja.cell(fila, 1).value == 'ACTIVO':
                filadatos = fila
        for columna in range(2, hoja.ncols):
            nombre_entidad = hoja.cell(filadatos-1, columna).value
            if nombre_entidad != 'TOTAL':
                arreglar_nombres(nombre_entidad, j)
                cartera_total = 0
                cartera_a = 0
                for fila in range(filadatos, hoja.nrows):
                    cuenta_puc = str(int(hoja.cell(fila, 0).value))
        #                 nombre_cuenta = hoja.cell(fila, 1).value
                    if cuenta_puc in ['140400','140800','141000','141200','141400']: # total cartera
                        cartera_total += hoja.cell(fila, columna).value
                    if cuenta_puc in ['140405','140410','140805','141005','141205','141405','141430','141460']: # cartera en A
                        cartera_a += hoja.cell(fila, columna).value
                    if cuenta_puc == '590000':
                        j[nombre_entidad]['resultados'].append(hoja.cell(fila, columna).value)
                j[nombre_entidad]['fechas'].append(fecha_str)
                j[nombre_entidad]['cartera_total'].append(cartera_total)
                j[nombre_entidad]['cartera_A'].append(cartera_a)
                j[nombre_entidad]['ICC'].append(1 - cartera_a/cartera_total)

        contador_archivos += 1
        print(contador_archivos, end = ' ')
    print('Fin')

    for i in j.keys():
        csv = 'fechas,cartera_total,cartera_A,ICC,resultados\r\n'
        for k in range(len(j[i]['fechas'])):
            csv += j[i]['fechas'][k] + ','
            csv += str(j[i]['cartera_total'][k]) + ','
            csv += str(j[i]['cartera_A'][k]) + ','
            csv += str(j[i]['ICC'][k]) + ','
            csv += str(j[i]['resultados'][k])
            csv += '\r\n'
        j[i]['csv'] = str(base64.b64encode(bytes(csv, 'utf8')))[2:-1]

    json_archivo = open(directorio_txt + 'datos.json', 'w', encoding = 'utf8')
    json.dump(j, json_archivo, ensure_ascii=False, indent=2)
    json_archivo.close()
