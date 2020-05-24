import re, os, shutil

dir_src = 'C:\\Users\\Juan\\Dropbox\\CV'
dir_dst = 'C:\\Users\\Juan\\Documents\\sfc\\CV.pdf'

lista_archivos = os.listdir(dir_src)

matches = [re.search('CV - v[0-9]+ - Eng.pdf', x) for x in lista_archivos]

matches2 = [x for x in matches if x != None]

if len(matches2) == 1:
    shutil.copy2(os.path.join(dir_src, matches2[0].string), dir_dst)