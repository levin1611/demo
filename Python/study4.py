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