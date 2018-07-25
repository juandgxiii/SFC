# Script para descargar información de bancos de la Superfinanciera y mostrar alertas
# TODO: incluir dataframe de pandas, analizar principales cifras

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

#fechas_array = [arreglar_fecha(x[-13:-5]) for x in links] # array de fechas en formato ddmmaaaa

os.chdir(directorio_archivos)

lista_archivos = []

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

input("")
