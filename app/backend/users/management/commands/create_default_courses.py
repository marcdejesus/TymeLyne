from django.core.management.base import BaseCommand
from users.models import Course, Module, Lesson, Activity
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Creates default courses with complete structure in the database'

    def handle(self, *args, **options):
        # Define default courses
        courses = [
            {
                'title': 'Python Fundamentals',
                'description': 'Learn the basics of Python programming, from variables to functions and modules.',
                'image': 'courses/python.png',
                'is_ai_generated': False,
                'estimated_duration': '240',  # minutes
                'difficulty': 'beginner',
                'modules': [
                    {
                        'title': 'Introduction to Python',
                        'description': 'Get started with Python basics',
                        'order': 1,
                        'lessons': [
                            {
                                'title': 'What is Python?',
                                'content': 'Introduction to the Python programming language and its applications.',
                                'order': 1,
                                'activities': [
                                    {
                                        'title': 'Introduction to Python',
                                        'description': 'Learn about Python and its history',
                                        'activity_type': 'reading',
                                        'content': '# Introduction to Python\n\nPython is a high-level, interpreted programming language known for its readability and simplicity. Created by Guido van Rossum and first released in 1991, Python has become one of the most popular programming languages in the world.\n\n## Why Python?\n\n- **Easy to learn**: Readable syntax similar to English\n- **Versatile**: Used in web development, data science, AI, automation, and more\n- **Large ecosystem**: Thousands of libraries and frameworks\n- **Community support**: Active community and excellent documentation',
                                        'order': 1,
                                        'xp_reward': 10,
                                    },
                                    {
                                        'title': 'Python Use Cases',
                                        'description': 'Discover where Python is used in the real world',
                                        'activity_type': 'reading',
                                        'content': '# Python Use Cases\n\nPython is used in many different fields:\n\n## Data Science and Machine Learning\n- Data analysis with pandas and NumPy\n- Machine learning with scikit-learn, TensorFlow, and PyTorch\n- Data visualization with Matplotlib and Seaborn\n\n## Web Development\n- Backend development with Django and Flask\n- API development with FastAPI\n\n## Automation\n- Scripting repetitive tasks\n- Testing automation\n- DevOps tools\n\n## Other Applications\n- Game development with Pygame\n- Scientific computing\n- Finance and trading algorithms',
                                        'order': 2,
                                        'xp_reward': 10,
                                    },
                                    {
                                        'title': 'Python Quiz',
                                        'description': 'Test your knowledge about Python basics',
                                        'activity_type': 'quiz',
                                        'content': '[{"question":"What year was Python first released?","options":["1989","1991","1995","2000"],"correct_answer":"1991"},{"question":"Who created Python?","options":["Linus Torvalds","Guido van Rossum","Bill Gates","Tim Berners-Lee"],"correct_answer":"Guido van Rossum"},{"question":"Python is known for its:","options":["Complex syntax","Readability","Speed","Static typing"],"correct_answer":"Readability"}]',
                                        'order': 3,
                                        'xp_reward': 20,
                                    },
                                ]
                            },
                            {
                                'title': 'Python Setup',
                                'content': 'Learn how to install Python and set up your development environment.',
                                'order': 2,
                                'activities': [
                                    {
                                        'title': 'Installing Python',
                                        'description': 'Learn how to install Python on your system',
                                        'activity_type': 'reading',
                                        'content': '# Installing Python\n\nBefore you can start programming in Python, you need to install it on your computer.\n\n## Windows\n1. Go to [python.org](https://python.org)\n2. Download the latest Python installer\n3. Run the installer and check "Add Python to PATH"\n4. Click "Install Now"\n\n## macOS\n1. Install Homebrew if you don\'t have it: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`\n2. Install Python: `brew install python`\n\n## Linux\nMost Linux distributions come with Python pre-installed. If not:\n\n- Ubuntu/Debian: `sudo apt-get install python3`\n- Fedora: `sudo dnf install python3`\n\n## Verifying Installation\nOpen a terminal or command prompt and type:\n```\npython --version\n```\nor\n```\npython3 --version\n```',
                                        'order': 1,
                                        'xp_reward': 15,
                                    },
                                    {
                                        'title': 'Setting Up a Virtual Environment',
                                        'description': 'Learn about Python virtual environments',
                                        'activity_type': 'reading',
                                        'content': '# Python Virtual Environments\n\nVirtual environments are isolated Python environments that allow you to install packages for specific projects without affecting other projects.\n\n## Creating a Virtual Environment\n\n```bash\n# Create a virtual environment named "venv"\npython -m venv venv\n\n# Activate the virtual environment\n# Windows\nvenv\\Scripts\\activate\n\n# macOS/Linux\nsource venv/bin/activate\n```\n\n## Installing Packages\nOnce your virtual environment is activated, you can install packages with pip:\n\n```bash\npip install package_name\n```\n\n## Deactivating\nTo exit the virtual environment:\n\n```bash\ndeactivate\n```',
                                        'order': 2,
                                        'xp_reward': 15,
                                    },
                                    {
                                        'title': 'Your First Python Program',
                                        'description': 'Write and run your first Python program',
                                        'activity_type': 'exercise',
                                        'content': '# Your First Python Program\n\n## The Classic "Hello, World!"\n\nLet\'s create your first Python program:\n\n```python\nprint("Hello, World!")\n```\n\nSave this code in a file named `hello.py` and run it:\n\n```bash\npython hello.py\n```\n\nYou should see "Hello, World!" printed on your screen.\n\n## Exercise\nModify the program to print a custom greeting with your name.\n\n```python\nname = "Your Name"\nprint(f"Hello, {name}! Welcome to Python programming.")\n```',
                                        'order': 3,
                                        'xp_reward': 25,
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        'title': 'Python Data Types',
                        'description': 'Learn about Python variables and data types',
                        'order': 2,
                        'lessons': [
                            {
                                'title': 'Variables and Basic Data Types',
                                'content': 'Understanding variables and the fundamental data types in Python.',
                                'order': 1,
                                'activities': [
                                    {
                                        'title': 'Python Variables',
                                        'description': 'Understanding variables in Python',
                                        'activity_type': 'reading',
                                        'content': '# Python Variables\n\nVariables are containers for storing data values. Python has no command for declaring a variable - a variable is created the moment you first assign a value to it.\n\n```python\n# Creating variables\nname = "John"\nage = 30\nheight = 5.11\nis_student = True\n\n# Printing variables\nprint(name)        # Output: John\nprint(age)         # Output: 30\nprint(height)      # Output: 5.11\nprint(is_student)  # Output: True\n```\n\n## Variable Naming Rules\n\n- Must start with a letter or underscore\n- Cannot start with a number\n- Can only contain alphanumeric characters and underscores (A-z, 0-9, and _)\n- Case-sensitive (age, Age, and AGE are different variables)\n\n## Python Variable Naming Conventions\n\n- Use lowercase letters for variable names\n- Use underscores to separate words (snake_case)\n- Use meaningful names that describe the data',
                                        'order': 1,
                                        'xp_reward': 20,
                                    },
                                    {
                                        'title': 'Python Basic Data Types',
                                        'description': 'Learn about fundamental data types in Python',
                                        'activity_type': 'reading',
                                        'content': '# Python Basic Data Types\n\nPython has several built-in data types:\n\n## Numeric Types\n\n### Integers (int)\nWhole numbers without decimal points.\n```python\nx = 10\ny = -5\nbig_num = 1_000_000  # Underscores for readability\n```\n\n### Floating-Point Numbers (float)\nNumbers with decimal points.\n```python\npi = 3.14159\ntemperature = -2.5\n```\n\n### Complex Numbers (complex)\nNumbers with real and imaginary parts.\n```python\nz = 3 + 4j\n```\n\n## Text Type\n\n### Strings (str)\nSequences of characters enclosed in quotes.\n```python\nname = "Alice"\nmessage = \'Hello, world!\'\nmultiline = """This is a\nmultiline string"""\n```\n\n## Boolean Type\n\n### Boolean (bool)\nLogical values: True or False.\n```python\nis_valid = True\nis_complete = False\n```\n\n## Finding the Type\nYou can check the type of any variable using the `type()` function:\n\n```python\nx = 10\nprint(type(x))  # Output: <class \'int\'>\n\nname = "John"\nprint(type(name))  # Output: <class \'str\'>\n```',
                                        'order': 2,
                                        'xp_reward': 20,
                                    },
                                    {
                                        'title': 'Data Types Practice',
                                        'description': 'Practice working with Python data types',
                                        'activity_type': 'exercise',
                                        'content': '# Data Types Practice\n\n## Exercise: Working with Different Data Types\n\nComplete the following code to create variables of different types:\n\n```python\n# Create variables of different types\n\n# 1. Create an integer variable called \'age\' with your age\n\n# 2. Create a float variable called \'height\' with your height in meters\n\n# 3. Create a string variable called \'name\' with your name\n\n# 4. Create a boolean variable called \'is_programmer\' and set it to True\n\n# 5. Print the type of each variable\n```\n\n## Solution\n\n```python\n# Create variables of different types\n\n# 1. Create an integer variable called \'age\' with your age\nage = 25\n\n# 2. Create a float variable called \'height\' with your height in meters\nheight = 1.75\n\n# 3. Create a string variable called \'name\' with your name\nname = "John Doe"\n\n# 4. Create a boolean variable called \'is_programmer\' and set it to True\nis_programmer = True\n\n# 5. Print the type of each variable\nprint(type(age))         # Output: <class \'int\'>\nprint(type(height))      # Output: <class \'float\'>\nprint(type(name))        # Output: <class \'str\'>\nprint(type(is_programmer))  # Output: <class \'bool\'>\n```',
                                        'order': 3,
                                        'xp_reward': 30,
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                'title': 'Web Development Basics',
                'description': 'Learn the fundamentals of web development with HTML, CSS, and JavaScript.',
                'image': 'courses/web-dev.png',
                'is_ai_generated': False,
                'estimated_duration': '300',  # minutes
                'difficulty': 'beginner',
                'modules': [
                    {
                        'title': 'Introduction to HTML',
                        'description': 'Learn the basics of HTML and structure web pages',
                        'order': 1,
                        'lessons': [
                            {
                                'title': 'HTML Fundamentals',
                                'content': 'Introduction to HTML elements and document structure.',
                                'order': 1,
                                'activities': [
                                    {
                                        'title': 'What is HTML?',
                                        'description': 'Introduction to HTML and its purpose',
                                        'activity_type': 'reading',
                                        'content': '# Introduction to HTML\n\nHTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure and content of a web page.\n\n## Basic HTML Document Structure\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My First Web Page</title>\n    <meta charset="UTF-8">\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>This is my first web page.</p>\n</body>\n</html>\n```\n\n## Key HTML Elements\n\n- `<!DOCTYPE html>`: Declares the document type and HTML version\n- `<html>`: The root element of an HTML page\n- `<head>`: Contains meta-information about the HTML document\n- `<title>`: Specifies the title of the HTML document\n- `<body>`: Contains the visible page content\n- `<h1>` to `<h6>`: Heading elements\n- `<p>`: Paragraph element',
                                        'order': 1,
                                        'xp_reward': 15,
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ]
        
        # Counter for created courses and components
        created_courses = 0
        created_modules = 0
        created_lessons = 0
        created_activities = 0
        
        # Create courses with full structure
        for course_data in courses:
            # Extract modules before creating course
            modules_data = course_data.pop('modules', [])
            
            # Create or update course
            course, course_created = Course.objects.update_or_create(
                title=course_data['title'],
                defaults=course_data
            )
            
            if course_created:
                created_courses += 1
                self.stdout.write(f"Created course: {course.title}")
            else:
                self.stdout.write(f"Updated course: {course.title}")
            
            # Create modules for this course
            for module_data in modules_data:
                # Extract lessons before creating module
                lessons_data = module_data.pop('lessons', [])
                
                # Create or update module
                module, module_created = Module.objects.update_or_create(
                    course=course,
                    order=module_data['order'],
                    defaults=module_data
                )
                
                if module_created:
                    created_modules += 1
                    self.stdout.write(f"  Created module: {module.title}")
                else:
                    self.stdout.write(f"  Updated module: {module.title}")
                
                # Create lessons for this module
                for lesson_data in lessons_data:
                    # Extract activities before creating lesson
                    activities_data = lesson_data.pop('activities', [])
                    
                    # Create or update lesson
                    lesson, lesson_created = Lesson.objects.update_or_create(
                        module=module,
                        order=lesson_data['order'],
                        defaults=lesson_data
                    )
                    
                    if lesson_created:
                        created_lessons += 1
                        self.stdout.write(f"    Created lesson: {lesson.title}")
                    else:
                        self.stdout.write(f"    Updated lesson: {lesson.title}")
                    
                    # Create activities for this lesson
                    for activity_data in activities_data:
                        # Create or update activity
                        activity, activity_created = Activity.objects.update_or_create(
                            lesson=lesson,
                            order=activity_data['order'],
                            defaults=activity_data
                        )
                        
                        if activity_created:
                            created_activities += 1
                            self.stdout.write(f"      Created activity: {activity.title}")
                        else:
                            self.stdout.write(f"      Updated activity: {activity.title}")
        
        # Print summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully added {created_courses} courses, {created_modules} modules, '
                f'{created_lessons} lessons, and {created_activities} activities to the database'
            )
        ) 