/**
 * Mock Python course data for UI testing
 */
const pythonCourse = {
  id: 'python101',
  title: 'Python Fundamentals',
  description: 'Learn Python programming from scratch with this comprehensive course covering syntax, data types, control flow, and functions.',
  image: 'python-logo.png',
  author: 'Tymelyne Team',
  timeToComplete: '8-10 hours',
  xpReward: 1000,
  progress: 0,
  goals: [
    'Write Python code with proper syntax',
    'Understand and use different data types',
    'Create and manipulate variables',
    'Use conditional statements and loops',
    'Build reusable functions',
    'Import and use modules'
  ],
  modules: [
    {
      id: 'module1',
      title: 'Getting Started with Python',
      description: 'Introduction to Python programming and its core concepts.',
      activities: [
        {
          id: 'activity1_1',
          type: 'lesson',
          title: 'Introduction to Python',
          content: `# Introduction to Python

Python is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum in 1991, Python has become one of the most popular programming languages in the world.

## Why Learn Python?

- **Easy to learn**: Simple, readable syntax
- **Versatile**: Used in web development, data science, AI, automation, and more
- **Large community**: Extensive libraries and frameworks
- **High demand**: One of the most in-demand programming languages

## Python's Philosophy

Python's design philosophy emphasizes code readability with its notable use of significant whitespace. Its language constructs and object-oriented approach aim to help programmers write clear, logical code for small and large-scale projects.

Let's write our first Python program:

\`\`\`python
print("Hello, World!")
\`\`\`

This simple line prints "Hello, World!" to the console - your first step in Python programming!`
        },
        {
          id: 'activity1_2',
          type: 'concept-check',
          title: 'Python Basics Quiz',
          questions: [
            {
              id: 'q1_1',
              type: 'multiple-choice',
              question: 'Who created Python?',
              options: [
                'Linus Torvalds',
                'Guido van Rossum',
                'James Gosling',
                'Bjarne Stroustrup'
              ],
              correctAnswer: 1
            },
            {
              id: 'q1_2',
              type: 'true-false',
              question: 'Python uses curly braces {} for code blocks like many other languages.',
              correctAnswer: false
            },
            {
              id: 'q1_3',
              type: 'multiple-choice',
              question: 'What is Python primarily used for?',
              options: [
                'Mobile app development only',
                'System programming only',
                'Frontend web development only',
                'Various applications including web development, data analysis, AI, and automation'
              ],
              correctAnswer: 3
            }
          ]
        },
        {
          id: 'activity1_3',
          type: 'practice',
          title: 'Your First Python Program',
          instructions: 'Write a Python program that prints "Hello, [your name]!" to the console.',
          starterCode: '# Write your code below\n\n',
          solution: 'print("Hello, Student!")',
          validationFunction: 'return code.includes("print") && code.includes("Hello");'
        }
      ]
    },
    {
      id: 'module2',
      title: 'Python Syntax and Data Types',
      description: 'Learn about Python syntax rules and the core data types.',
      activities: [
        {
          id: 'activity2_1',
          type: 'lesson',
          title: 'Variables and Data Types',
          content: `# Variables and Data Types

In Python, variables are used to store data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

## Basic Data Types

Python has several built-in data types:

### 1. Numbers
- **Integers**: Whole numbers like 3, 300, or -10
- **Floats**: Decimal numbers like 3.14 or -0.001

\`\`\`python
age = 25        # integer
price = 19.99   # float
\`\`\`

### 2. Strings
Text enclosed in quotes (single or double):

\`\`\`python
name = "Alice"
message = 'Python is fun!'
\`\`\`

### 3. Booleans
True or False values:

\`\`\`python
is_student = True
is_complete = False
\`\`\`

### 4. Lists
Ordered collections that can store different types of items:

\`\`\`python
fruits = ["apple", "banana", "cherry"]
mixed_list = [1, "hello", True, 3.14]
\`\`\`

### 5. Tuples
Similar to lists, but immutable (cannot be changed after creation):

\`\`\`python
coordinates = (10, 20)
\`\`\`

### 6. Dictionaries
Key-value pairs:

\`\`\`python
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}
\`\`\`

## Type Conversion

You can convert between types:

\`\`\`python
x = 10          # integer
y = float(x)    # converts to 10.0
z = str(x)      # converts to "10"
\`\`\`

## Checking Types

Use the \`type()\` function to check a variable's data type:

\`\`\`python
x = 5
print(type(x))  # outputs <class 'int'>
\`\`\`

Understanding data types is fundamental to programming in Python!`
        },
        {
          id: 'activity2_2',
          type: 'concept-check',
          title: 'Data Types Quiz',
          questions: [
            {
              id: 'q2_1',
              type: 'multiple-choice',
              question: 'Which of the following is a mutable data type in Python?',
              options: [
                'String',
                'Tuple',
                'List',
                'Integer'
              ],
              correctAnswer: 2
            },
            {
              id: 'q2_2',
              type: 'true-false',
              question: 'In Python, you must declare a variable type before using it.',
              correctAnswer: false
            },
            {
              id: 'q2_3',
              type: 'multiple-choice',
              question: 'What is the data type of \`x\` in \`x = 3.14\`?',
              options: [
                'int',
                'float',
                'double',
                'decimal'
              ],
              correctAnswer: 1
            }
          ]
        },
        {
          id: 'activity2_3',
          type: 'practice',
          title: 'Working with Variables',
          instructions: 'Create variables for name, age, and height. Print a sentence that uses all three variables.',
          starterCode: '# Create your variables below\n\n# Print a sentence using all variables\n',
          solution: 'name = "Alex"\nage = 25\nheight = 175.5\nprint(f"{name} is {age} years old and {height} cm tall.")',
          validationFunction: 'return code.includes("name") && code.includes("age") && code.includes("print");'
        },
        {
          id: 'activity2_4',
          type: 'quiz',
          title: 'Module 2 Quiz',
          questions: [
            {
              id: 'quiz2_1',
              type: 'multiple-choice',
              question: 'Which data structure uses key-value pairs in Python?',
              options: [
                'List',
                'Tuple',
                'Set',
                'Dictionary'
              ],
              correctAnswer: 3
            },
            {
              id: 'quiz2_2',
              type: 'coding',
              question: 'Write code to create a list of three different fruits.',
              starterCode: '',
              solution: 'fruits = ["apple", "banana", "orange"]'
            }
          ]
        }
      ]
    },
    {
      id: 'module3',
      title: 'Control Flow in Python',
      description: 'Master Python control structures including conditionals and loops.',
      activities: [
        {
          id: 'activity3_1',
          type: 'lesson',
          title: 'Conditional Statements',
          content: `# Conditional Statements

Conditional statements allow you to execute certain code blocks only when specific conditions are met. Python uses if, elif, and else statements for this purpose.

## Basic if Statement

\`\`\`python
age = 18

if age >= 18:
    print("You are an adult")
\`\`\`

## if-else Statement

\`\`\`python
temperature = 15

if temperature > 25:
    print("It's warm outside")
else:
    print("It's cool outside")
\`\`\`

## if-elif-else Statement

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is {grade}")
\`\`\`

## Nested if Statements

You can also nest if statements inside other if statements:

\`\`\`python
num = 15

if num > 0:
    print("Positive number")
    
    if num % 2 == 0:
        print("Even number")
    else:
        print("Odd number")
else:
    print("Not a positive number")
\`\`\`

## Logical Operators

Combine conditions with logical operators:
- \`and\`: Both conditions must be True
- \`or\`: At least one condition must be True
- \`not\`: Inverts the condition

\`\`\`python
age = 25
has_license = True

if age >= 18 and has_license:
    print("You can drive")
else:
    print("You cannot drive")
\`\`\`

## Conditional Expressions (Ternary Operator)

A shorter syntax for simple if-else statements:

\`\`\`python
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # Outputs: "adult"
\`\`\`

Conditional statements are essential for creating programs that can make decisions!`
        },
        {
          id: 'activity3_2',
          type: 'practice',
          title: 'Temperature Classifier',
          instructions: 'Write a program that takes a temperature and classifies it as "cold" (below 10°C), "mild" (10-25°C), or "hot" (above 25°C).',
          starterCode: 'temperature = 15\n\n# Write your code below\n',
          solution: 'temperature = 15\n\nif temperature < 10:\n    print("cold")\nelif temperature <= 25:\n    print("mild")\nelse:\n    print("hot")',
          validationFunction: 'return code.includes("if") && code.includes("elif") && code.includes("else");'
        },
        {
          id: 'activity3_3',
          type: 'lesson',
          title: 'Loops in Python',
          content: `# Loops in Python

Loops allow you to execute a block of code multiple times. Python has two main types of loops: for loops and while loops.

## For Loops

For loops are used to iterate over a sequence (like a list, tuple, string) or other iterable objects.

### Basic for loop with a list:

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
# Outputs:
# apple
# banana
# cherry
\`\`\`

### Using range():

\`\`\`python
for i in range(5):  # 0 to 4
    print(i)
# Outputs: 0, 1, 2, 3, 4

for i in range(2, 6):  # 2 to 5
    print(i)
# Outputs: 2, 3, 4, 5

for i in range(1, 10, 2):  # 1 to 9, step 2
    print(i)
# Outputs: 1, 3, 5, 7, 9
\`\`\`

## While Loops

While loops execute as long as a condition is true.

\`\`\`python
count = 0

while count < 5:
    print(count)
    count += 1
# Outputs: 0, 1, 2, 3, 4
\`\`\`

### Break and Continue

The \`break\` statement exits the loop, while \`continue\` skips to the next iteration.

\`\`\`python
for i in range(10):
    if i == 3:
        continue  # Skip 3
    if i == 7:
        break     # Exit loop when i is 7
    print(i)
# Outputs: 0, 1, 2, 4, 5, 6
\`\`\`

## Loop with else

Loops can have an else clause that executes when the loop is finished normally (not by a break):

\`\`\`python
for i in range(5):
    print(i)
else:
    print("Loop completed")
\`\`\`

## Nested Loops

You can place loops inside other loops:

\`\`\`python
for i in range(3):
    for j in range(2):
        print(f"i={i}, j={j}")
\`\`\`

Loops are essential for automating repetitive tasks in programming!`
        },
        {
          id: 'activity3_4',
          type: 'practice',
          title: 'Sum Calculator',
          instructions: 'Write a program that calculates the sum of all numbers from 1 to 10 using a loop.',
          starterCode: '# Write your code below\n\n',
          solution: 'sum = 0\nfor i in range(1, 11):\n    sum += i\nprint(f"The sum is {sum}")',
          validationFunction: 'return (code.includes("for") || code.includes("while")) && code.includes("sum") && code.includes("range");'
        },
        {
          id: 'activity3_5',
          type: 'challenge',
          title: 'FizzBuzz Challenge',
          content: 'Write a program that prints numbers from 1 to 20. For multiples of 3, print "Fizz" instead of the number. For multiples of 5, print "Buzz". For numbers that are multiples of both 3 and 5, print "FizzBuzz".',
          time: 300,
          starterCode: '# Write your FizzBuzz solution below\n\n',
          solution: 'for i in range(1, 21):\n    if i % 3 == 0 and i % 5 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
          hints: [
            'Use the modulo operator (%) to check if a number is divisible by another number',
            'Check for FizzBuzz condition first (divisible by both 3 and 5)',
            'Remember to check conditions in the correct order'
          ]
        }
      ]
    },
    {
      id: 'module4',
      title: 'Functions and Modules',
      description: 'Learn to create reusable code with functions and organize code with modules.',
      activities: [
        {
          id: 'activity4_1',
          type: 'lesson',
          title: 'Python Functions',
          content: `# Python Functions

Functions are blocks of reusable code designed to perform a specific task. They help in organizing code, making it more modular and reusable.

## Defining a Function

Use the \`def\` keyword to define a function:

\`\`\`python
def greet():
    print("Hello, World!")

# Call the function
greet()  # Outputs: Hello, World!
\`\`\`

## Functions with Parameters

Functions can accept parameters:

\`\`\`python
def greet_person(name):
    print(f"Hello, {name}!")

greet_person("Alice")  # Outputs: Hello, Alice!
\`\`\`

## Return Values

Functions can return values using the \`return\` statement:

\`\`\`python
def add_numbers(a, b):
    return a + b

result = add_numbers(5, 3)
print(result)  # Outputs: 8
\`\`\`

## Default Parameter Values

Parameters can have default values:

\`\`\`python
def greet_with_message(name, message="Good day"):
    print(f"{message}, {name}!")

greet_with_message("Bob")  # Outputs: Good day, Bob!
greet_with_message("Charlie", "Welcome")  # Outputs: Welcome, Charlie!
\`\`\`

## Variable Number of Arguments

Use \`*args\` for variable positional arguments and \`**kwargs\` for variable keyword arguments:

\`\`\`python
def sum_all(*numbers):
    total = 0
    for num in numbers:
        total += num
    return total

print(sum_all(1, 2, 3, 4))  # Outputs: 10

def person_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

person_info(name="Alice", age=30, city="New York")
\`\`\`

## Function Docstrings

Document your functions using docstrings:

\`\`\`python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.
    
    Args:
        length: The length of the rectangle
        width: The width of the rectangle
        
    Returns:
        The area of the rectangle
    """
    return length * width
\`\`\`

## Lambda Functions

Small anonymous functions created with the \`lambda\` keyword:

\`\`\`python
multiply = lambda x, y: x * y
print(multiply(5, 3))  # Outputs: 15
\`\`\`

Functions are essential building blocks for organizing and reusing code in Python!`
        },
        {
          id: 'activity4_2',
          type: 'practice',
          title: 'Creating Functions',
          instructions: 'Write a function called calculate_rectangle_area that takes length and width as parameters and returns the area of the rectangle.',
          starterCode: '# Write your function below\n\n# Test your function\nprint(calculate_rectangle_area(5, 3))',
          solution: 'def calculate_rectangle_area(length, width):\n    return length * width\n\n# Test your function\nprint(calculate_rectangle_area(5, 3))',
          validationFunction: 'return code.includes("def calculate_rectangle_area") && code.includes("return") && code.includes("*");'
        },
        {
          id: 'activity4_3',
          type: 'lesson',
          title: 'Python Modules',
          content: `# Python Modules

Modules in Python are files containing Python code that can be imported and used in your programs. They help organize code into logical units that can be reused.

## Using Built-in Modules

Python comes with many built-in modules:

\`\`\`python
# Import the math module
import math

# Using functions from the math module
print(math.sqrt(16))  # Output: 4.0
print(math.pi)        # Output: 3.141592653589793

# Import specific functions from a module
from random import randint

# Generate a random number between 1 and 10
print(randint(1, 10))
\`\`\`

## Importing with Aliases

You can create aliases for modules:

\`\`\`python
import math as m

print(m.sqrt(25))  # Output: 5.0
\`\`\`

## Creating Your Own Modules

You can create your own modules by simply creating a .py file:

**my_module.py:**
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

PI = 3.14159
\`\`\`

**main.py:**
\`\`\`python
import my_module

print(my_module.greet("Alice"))   # Output: Hello, Alice!
print(my_module.add(5, 3))        # Output: 8
print(my_module.PI)               # Output: 3.14159
\`\`\`

## Python Packages

Packages are directories that contain multiple module files. They include a special file called \`__init__.py\` that marks the directory as a package.

## The Python Standard Library

Python comes with a vast standard library of modules for various tasks:

- \`os\` - Operating system interfaces
- \`sys\` - System-specific parameters and functions
- \`datetime\` - Date and time handling
- \`json\` - JSON encoding and decoding
- \`re\` - Regular expressions
- \`random\` - Generate random numbers
- \`http\` - HTTP libraries
- \`urllib\` - URL handling modules
- \`email\` - Email handling
- \`sqlite3\` - SQLite database interface

## Third-party Modules

Python has a rich ecosystem of third-party modules available through pip:

\`\`\`bash
pip install numpy  # Install numpy package
\`\`\`

\`\`\`python
import numpy as np

arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())  # Calculate mean of array
\`\`\`

Modules and packages help organize code and leverage the work of others, making Python development efficient and powerful!`
        },
        {
          id: 'activity4_4',
          type: 'practice',
          title: 'Using Built-in Modules',
          instructions: 'Write a program that uses the random module to generate a random number between 1 and 100, then checks if it\'s even or odd.',
          starterCode: '# Import the required module\n\n# Generate a random number\n\n# Check if it\'s even or odd\n',
          solution: 'import random\n\n# Generate a random number\nnum = random.randint(1, 100)\nprint(f"Random number: {num}")\n\n# Check if it\'s even or odd\nif num % 2 == 0:\n    print("The number is even")\nelse:\n    print("The number is odd")',
          validationFunction: 'return code.includes("import random") && code.includes("randint") && code.includes("if");'
        },
        {
          id: 'activity4_5',
          type: 'challenge',
          title: 'Temperature Converter',
          content: 'Create a module with functions to convert between Celsius and Fahrenheit temperatures. Then write a program that uses this module to convert temperatures entered by the user.',
          time: 360,
          starterCode: '# Create your module functions here\n\n# Your program to use the conversion functions\n',
          solution: '# Temperature conversion functions\ndef celsius_to_fahrenheit(celsius):\n    return (celsius * 9/5) + 32\n\ndef fahrenheit_to_celsius(fahrenheit):\n    return (fahrenheit - 32) * 5/9\n\n# Main program\ntemp = 25  # Simulating user input\n\nprint(f"{temp}°C = {celsius_to_fahrenheit(temp):.2f}°F")\nprint(f"{temp}°F = {fahrenheit_to_celsius(temp):.2f}°C")',
          hints: [
            'The formula for C to F is: (C × 9/5) + 32',
            'The formula for F to C is: (F - 32) × 5/9',
            'Use functions to make your code reusable'
          ]
        },
        {
          id: 'activity4_6',
          type: 'quiz',
          title: 'Functions and Modules Quiz',
          questions: [
            {
              id: 'quiz4_1',
              type: 'multiple-choice',
              question: 'Which keyword is used to define a function in Python?',
              options: [
                'function',
                'def',
                'fun',
                'define'
              ],
              correctAnswer: 1
            },
            {
              id: 'quiz4_2',
              type: 'true-false',
              question: 'In Python, a module can contain variables, functions, and classes.',
              correctAnswer: true
            },
            {
              id: 'quiz4_3',
              type: 'multiple-choice',
              question: 'What is the purpose of the "return" statement in a function?',
              options: [
                'To print a value to the console',
                'To end the function execution and send a value back',
                'To import a module',
                'To create a loop'
              ],
              correctAnswer: 1
            }
          ]
        }
      ]
    }
  ]
};

export default pythonCourse; 