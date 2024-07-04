# flag = 1

# while (flag): 
#     print ('欢迎访问菜鸟教程!')
 
# print ("Good bye!")

count = 0
while count < 5:
   print (count, " 小于 5")
   count = count + 1
else:
   print (count, " 大于或等于 5")

sites = ["Baidu", "Google","Runoob","Taobao"]
for site in sites:
    print(site)

word = 'runoob'
 
for letter in word:
    print(letter)

for number in range(1, 6):
    print(number)

for x in range(6):
  print(x)
else:
  print("Finally finished!")


sites = ["Baidu", "Google","Runoob","Taobao"]
for site in sites:
    if site == "Runoob":
        print("菜鸟教程!")
        break
    print("循环数据 " + site)
else:
    print("没有循环数据!")
print("完成循环!")


for n in range(2,10):
    for x in range(2,n):
       if n % x == 0:
          print (n, '等于', x, '*', n//x)
          break
    else:
       print(n, '是质数')

for letter in 'Runoob': 
   if letter == 'o':
      pass
      print ('执行 pass 块')
   print ('当前字母 :', letter)
 
print ("Good bye!")

a, b = 0, 1
while b < 10:
    print(b)
    a, b = b, a+b

a, b = 0, 1
while b < 1000:
    print(b, end=',')
    a, b = b, a+b