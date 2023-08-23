tinydict = {'Name': 'Runoob', 'Age': 7, 'Class': 'First'}
print ("tinydict: ", tinydict, len(tinydict))
del tinydict['Class']
print ("tinydict: ", tinydict, len(tinydict))
if ('Alice' in tinydict):
    print ("tinydict['Alice']: ", tinydict['Alice'])
else:
    print ("没有这个值！")