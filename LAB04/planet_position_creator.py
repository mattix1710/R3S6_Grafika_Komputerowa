import pyperclip

#Creating cubes
sunRadius = 500
size = (5)/2            #in brackets - set diameter of a planet/moon
posX = sunRadius+11900                #difference from (0,0,0) position (radius of the Sun + distance in 'au' unified to simple 'units' used in OpenGL)
template = [-1.0, +1.0, -1.0,  -1.0, +1.0, +1.0,  +1.0, +1.0, +1.0, #3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
    -1.0, +1.0, -1.0,  +1.0, +1.0, +1.0,  +1.0, +1.0, -1.0,
  #Left
    -1.0, -1.0, +1.0,  -1.0, +1.0, +1.0,  -1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,  -1.0, +1.0, +1.0,  -1.0, +1.0, -1.0,
  #Right
    +1.0, +1.0, +1.0,  +1.0, -1.0, +1.0,  +1.0, -1.0, -1.0,
    +1.0, +1.0, +1.0,  +1.0, -1.0, -1.0,  +1.0, +1.0, -1.0,
  #Front
    +1.0, -1.0, +1.0,  +1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,
    -1.0, +1.0, +1.0,  -1.0, -1.0, +1.0,  +1.0, +1.0, +1.0, 
  #Back
    +1.0, +1.0, -1.0,  +1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,
    +1.0, +1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, +1.0, -1.0,
  #Bottom
    -1.0, -1.0, +1.0,  -1.0, -1.0, -1.0,  +1.0, -1.0, +1.0,
    +1.0, -1.0, +1.0,  -1.0, -1.0, -1.0,  +1.0, -1.0, -1.0]

###################################################################
# assumptions:
# Earth diameter = 20j
# Sun diameter = 1000j
# au = 600j
# size = diameter/2


###################################################################
# COUNT NEW POSITION
#
it = 1              #auxilliary iterator
movedCube = []      #create new empty list
for i in template:
    i = i*size      #for each coordinate - set its new size (i.e. Earth has size of 100 && Moon has size of 1)
    if(it % 3 == 1):    #for each X coordinate
        i = i+posX      #define its new position
    it += 1         #increment iterator
    movedCube.append(i)
#
####################################################################
# SAVE NEW COORDINATES TO STRING AND SAVE IT TO CLIPBOARD
#
cubeStr = ''
it = 1
for i in movedCube:
    cubeStr += str(i) + ', '
    #print(i, end=", ")
    if(it % 9 == 0):
        cubeStr += '\n'       #?add: \t\t
        #print("\n")
    it += 1
#
#   
pyperclip.copy(cubeStr)
print(pyperclip.paste())