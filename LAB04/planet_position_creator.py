#Creating cubes
size = 5
posX = 30                #difference from (0,0,0) position
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
# Earth diameter = 10j
# Sun diameter = 1000j
# au = 600j
# size = diameter/2


it = 1              #auxilliary iterator
movedCube = []      #create new empty list
for i in template:
    i = i*size      #for each coordinate - set its new size (i.e. Earth has size of 100 && Moon has size of 1)
    if(it % 3 == 1):    #for each X coordinate
        i = i+posX      #define its new position
    it += 1         #increment iterator
    movedCube.append(i)

it = 1
for i in movedCube:
    print(i, end=", ")
    if(it % 9 == 0):
        print("\n")
    it += 1
    
"""
print("old:")
print(template)
print("new:")
print(movedCube)
"""