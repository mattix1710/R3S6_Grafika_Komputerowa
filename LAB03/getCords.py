from random import randrange, uniform
from secrets import choice


HIGH_Y = 1.0
SCALE = 5.0
LOW_Y = 0.0
COLS = 2
ROWS = 3
POINTS = 3
total_size = 0

cords = open('cords.txt', 'w')
colours = open('colours.txt', 'w')

#randomize five shades between two colours (one for horizontal lines, one for vertical lines)
def randColour(horizontal = True):
	#green colour
	arrColour1 = [[0.59, 0.91, 0.64],[0.42, 0.83, 0.49],[0.33, 0.79, 0.4],[0.23, 0.67, 0.3],[0.17, 0.58, 0.24]]
	#yellow colour
	arrColour2 = [[1.0, 0.9, 0.75],[1.0, 0.83, 0.57],[1.0, 0.76, 0.41],[1.0, 0.69, 0.22],[0.95, 0.61, 0.09]]
	
	script = ''
 
	if(horizontal):
		arr = arrColour1
	else:
		arr = arrColour2

	for j in range(6):                      #repeat the same 3 points (3 subcolours of RGB) 6 times (3 points for triangle AND 2 triangles)
			for i in choice(arr):
					script += str(i) + ', '
	
	return script
    
    
def createScriptLine(arr, script, it = 0):
    aux = ''
    for i in range(COLS):
        for j in range(ROWS):
            for k in range(POINTS):
                aux += str(arr[i][j][k]*SCALE) + ', '
                
    if(script != ''):
        script += '/*NEW WALL*/ '
    script += aux
    return script

def readFromMap(map, start, end, step, horizontal = True):
	global total_size			#I will use global variable, so I need to use "global" keyword
	cont = False
	linePos = 0
	script = ''
 
	for it in range(start, end, step):
		line = map[linePos]
		linePos += 1
  
		if(horizontal):
			current_Z = float(it)
			current_X = 0.0
		else:
			current_X = float(it)
			current_Z = 12.0
   
		aux_arr = [[],[]]
		cont = False
		script += '//Line ' + str(it) + '\n'
		colours.write('//Line ' + str(it) + '\n')
  
		auxScript = ''
  
		for i in line:
			if(i != ' '):
				if(cont):					#if longer line
					if(horizontal):
						current_X += 1	#iterate current X pos
					else:
						current_Z -= 1	#iterate current Z pos
					continue
				cont = True
				aux_arr[0].append([current_X, LOW_Y, current_Z])	#create L1
				aux_arr[1].append([current_X, HIGH_Y, current_Z])	#create H1
    
				if(horizontal):
					current_X += 1
				else:
					current_Z -= 1
				continue
			if(cont):			#if not '-' or  '|', but has ended
				total_size += 1
				aux_arr[0].append([current_X, LOW_Y, current_Z])
				aux_arr[1].append([current_X, HIGH_Y, current_Z])
				aux_arr[0].append(aux_arr[1][0])
				aux_arr[1].append(aux_arr[0][1])
				auxScript = createScriptLine(aux_arr, auxScript, it=current_Z)
				colours.write(randColour(horizontal))
				aux_arr = [[],[]]
			cont = False

			if(horizontal):
				current_X += 1
			else:
				current_Z -= 1
		
		print('\n')
  
		#and for last element if was:
		if(cont):			#if not '-' or '|', but has ended
			total_size += 1
			aux_arr[0].append([current_X, LOW_Y, current_Z])
			aux_arr[1].append([current_X, HIGH_Y, current_Z])
			aux_arr[0].append(aux_arr[1][0])
			aux_arr[1].append(aux_arr[0][1])
			auxScript = createScriptLine(aux_arr, auxScript, it=current_Z)
			colours.write(randColour(horizontal))
			aux_arr = [[],[]]
	
		colours.write('\n')				#COLOURS - new line each line
	
		script += auxScript[:-1]
		script += '\n'

	#trim string:
	return script

mapH = ['-------- ---',
        ' --    ---- ',
        ' -- -----   ',
        ' - -- -     ',
        ' -          ',
        '-       - - ',
        '-     ----- ',
        ' - -- --    ',
        '-   -       ',
        '-- --       ',
        ' - -- -- -  ',
        '    ------- ',
        '-- ---------']

mapV = ['||||||||||||', #obrócone o 90* w prawo
        '   | |  | | ',
        '   |||||| ||',
        ' |||||||| ||',
        '||          ',
        '   |||| | | ',
        '|| ||| |||  ',
        '   |        ',
        '  |||  |||  ',
        '   ||| |||  ',
        '  |||  |||  ',
        ' |||| ||||| ',
        '||||||||||||']

############################

cords.write(readFromMap(mapH, 12, -1, -1, horizontal=True))		#12 - begin; -1 - stop (-1 because needs to be range <12,0>); -1 - step

cords.write('\n//==================================================================\n\n// VERTICAL LINES\n\n')
colours.write('\n\n//=================================================\n\n')

cords.write(readFromMap(mapV, 0, 13, 1, horizontal=False))			#0 - begin; 13 - stop (13 because needs to be range <0;12>); 1 - step


cords.close()
colours.close()

print('DONE: total_size = ' + str(total_size))