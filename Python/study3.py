age = int(input("请输入你家狗狗的年龄: "))
print("")
if age <= 0:
    print("你是在逗我吧!")
elif age == 1:
    print("相当于 14 岁的人。")
elif age == 2:
    print("相当于 22 岁的人。")
elif age > 2:
    human = 22 + (age -2)*5
    print("对应人类年龄: ", human)
 
### 退出提示
input("点击 enter 键退出")


# 该实例演示了数字猜谜游戏
number = 7
guess = -1
print("数字猜谜游戏!")
while guess != number:
    guess = int(input("请输入你猜的数字："))
 
    if guess == number:
        print("恭喜，你猜对了！")
    elif guess < number:
        print("猜的数字小了...")
    elif guess > number:
        print("猜的数字大了...")

print('----欢迎使用BMI计算程序----')
name=input('请键入您的姓名:')
height=eval(input('请键入您的身高(m):'))
weight=eval(input('请键入您的体重(kg):'))
gender=input('请键入你的性别(F/M)')
BMI=float(float(weight)/(float(height)**2))
#公式
if BMI<=18.4:
    print('姓名:',name,'身体状态:偏瘦')
elif BMI<=23.9:
    print('姓名:',name,'身体状态:正常')
elif BMI<=27.9:
    print('姓名:',name,'身体状态:超重')
elif BMI>=28:
    print('姓名:',name,'身体状态:肥胖')

import time;
#time模块
nowtime=(time.asctime(time.localtime(time.time())))
if gender=='F':
    print('感谢',name,'女士在',nowtime,'使用本程序,祝您身体健康!')
if gender=='M':
    print('感谢',name,'先生在',nowtime,'使用本程序,祝您身体健康!')