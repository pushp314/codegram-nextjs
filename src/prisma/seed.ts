
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
    {
        id: 'user_1',
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
        image: 'https://picsum.photos/seed/alex-doe/100/100',
        bio: 'Full-stack developer with a passion for open-source and serverless.',
    },
    {
        id: 'user_2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        image: 'https://picsum.photos/seed/jane-smith/100/100',
        bio: 'Frontend enthusiast who loves creating beautiful and accessible UIs.',
    }
];

const snippets = [
    {
        title: 'React Custom Hook for Debounce',
        description: 'A simple and effective custom hook in React to debounce any value, useful for search inputs.',
        code: `import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}`,
        language: 'typescript',
        authorId: 'user_1',
    },
    {
        title: 'Python Flask Minimal API',
        description: 'A minimal example of a REST API endpoint using Python and the Flask framework.',
        code: `from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route('/api/hello', methods=['GET'])\ndef get_hello():\n    return jsonify(message="Hello, World!")\n\nif __name__ == '__main__':\n    app.run(debug=True)`,
        language: 'python',
        authorId: 'user_1',
    },
    {
        title: 'CSS Animated Gradient Border',
        description: 'A pure CSS technique to create a card with a beautiful animated gradient border.',
        code: `@property --angle {\n  syntax: '<angle>';\n  initial-value: 0deg;\n  inherits: false;\n}\n\n.card {\n  position: relative;\n  border: 2px solid transparent;\n  background-clip: padding-box;\n  background-color: #1a1a1a;\n}\n\n.card::before {\n  content: '';\n  position: absolute;\n  top: 0; right: 0; bottom: 0; left: 0;\n  z-index: -1;\n  margin: -2px;\n  border-radius: inherit;\n  background: conic-gradient(from var(--angle), #f00, #0f0, #00f, #f00);\n  animation: rotate 4s linear infinite;\n}\n\n@keyframes rotate {\n  to { --angle: 360deg; }\n}`,
        language: 'css',
        authorId: 'user_2',
    },
    {
        title: 'JavaScript Array Deduplication',
        description: 'A concise way to remove duplicate values from a JavaScript array using Set.',
        code: `const numbers = [1, 2, 2, 3, 4, 4, 5];\nconst uniqueNumbers = [...new Set(numbers)];\nconsole.log(uniqueNumbers); // [1, 2, 3, 4, 5]`,
        language: 'javascript',
        authorId: 'user_2',
    },
    {
        title: 'Go Simple HTTP Server',
        description: 'A basic HTTP server in Go that responds with "Hello, World!".',
        code: `package main\n\nimport (\n\t"fmt"\n\t"log"\n\t"net/http"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintf(w, "Hello, World!")\n}\n\nfunc main() {\n\thttp.HandleFunc("/", handler)\n\tlog.Fatal(http.ListenAndServe(":8080", nil))\n}`,
        language: 'go',
        authorId: 'user_1',
    },
    {
        title: 'TSX Basic Component',
        description: 'A simple functional component in TSX with props.',
        code: `import React from 'react';\n\ninterface GreetingProps {\n  name: string;\n}\n\nconst Greeting: React.FC<GreetingProps> = ({ name }) => {\n  return <h1>Hello, {name}!</h1>;\n};\n\nexport default Greeting;`,
        language: 'tsx',
        authorId: 'user_2',
    },
    {
        title: 'Java Stream API Filter and Map',
        description: 'An example of using Java\'s Stream API to filter and transform a list of strings.',
        code: `import java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class Main {\n    public static void main(String[] args) {\n        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Adam");\n        List<String> upperCaseNames = names.stream()\n                                           .filter(name -> name.startsWith("A"))\n                                           .map(String::toUpperCase)\n                                           .collect(Collectors.toList());\n        System.out.println(upperCaseNames); // [ALICE, ADAM]\n    }\n}`,
        language: 'java',
        authorId: 'user_1',
    },
    {
        title: 'C# LINQ Example',
        description: 'Using LINQ in C# to query a collection of objects.',
        code: `using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\npublic class Program {\n    public static void Main() {\n        var numbers = new List<int> { 1, 2, 3, 4, 5, 6 };\n        var evenNumbers = from num in numbers\n                          where num % 2 == 0\n                          select num;\n\n        foreach (var n in evenNumbers) {\n            Console.WriteLine(n);\n        }\n    }\n}`,
        language: 'csharp',
        authorId: 'user_2',
    },
    {
        title: 'HTML Semantic Layout',
        description: 'A basic HTML5 page layout using semantic tags for better accessibility and SEO.',
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Semantic HTML</title>\n</head>\n<body>\n    <header>\n        <h1>My Website</h1>\n        <nav>\n            <a href="/home">Home</a>\n        </nav>\n    </header>\n    <main>\n        <article>\n            <h2>Article Title</h2>\n            <p>Article content...</p>\n        </article>\n    </main>\n    <footer>\n        <p>&copy; 2024 My Website</p>\n    </footer>\n</body>\n</html>`,
        language: 'html',
        authorId: 'user_1',
    },
    {
        title: 'JSX Conditional Rendering',
        description: 'A React component demonstrating conditional rendering using the ternary operator.',
        code: `function Welcome({ isLoggedIn }) {\n  return (\n    <div>\n      {isLoggedIn\n        ? <h1>Welcome back!</h1>\n        : <h1>Please sign in.</h1>\n      }\n    </div>\n  );\n}`,
        language: 'jsx',
        authorId: 'user_2',
    },
];

const docs = [
    {
        title: 'Getting Started with Next.js 14',
        slug: 'getting-started-with-nextjs-14',
        description: 'A comprehensive guide to setting up and building your first application with Next.js and the App Router.',
        content: '## Introduction\\nWelcome to the world of Next.js! This guide will walk you through the basics.\\n\\n### Step 1: Installation\\n...\\n',
        tags: ['nextjs', 'react', 'webdev'],
        authorId: 'user_1',
    },
    {
        title: 'Mastering Tailwind CSS',
        slug: 'mastering-tailwind-css',
        description: 'Learn advanced techniques and best practices for building beautiful UIs with Tailwind CSS.',
        content: '## Utility-First Fundamentals\\nTailwind CSS is a utility-first CSS framework...\\n',
        tags: ['css', 'tailwind', 'design'],
        authorId: 'user_2',
    },
    {
        title: 'Understanding Async/Await in JavaScript',
        slug: 'understanding-async-await-in-javascript',
        description: 'A deep dive into asynchronous JavaScript and how async/await simplifies your code.',
        content: '## The Problem with Callbacks\\n...\\n\\n## Promises to the Rescue\\n...\\n\\n## Enter Async/Await\\n...',
        tags: ['javascript', 'es6', 'async'],
        authorId: 'user_1',
    },
    {
        title: 'A Guide to Docker for Beginners',
        slug: 'a-guide-to-docker-for-beginners',
        description: 'Containerize your applications with Docker. This guide covers the basics from Dockerfiles to Docker Compose.',
        content: '## What is a Container?\\n...\\n\\n### Building Your First Image\\n...',
        tags: ['docker', 'devops', 'containers'],
        authorId: 'user_2',
    },
    {
        title: 'Introduction to Prisma ORM',
        slug: 'introduction-to-prisma-orm',
        description: 'Learn how to use Prisma, the next-generation ORM for Node.js and TypeScript.',
        content: '## Setting up Prisma\\n...\\n\\n### Writing Your First Query\\n...',
        tags: ['prisma', 'database', 'nodejs', 'typescript'],
        authorId: 'user_1',
    },
    {
        title: 'Building a REST API with Express.js',
        slug: 'building-a-rest-api-with-expressjs',
        description: 'A step-by-step tutorial on creating a fully functional REST API using Node.js and Express.',
        content: '## Initializing the Project\\n`npm init -y`\\n\\n### Creating the Server\\n...',
        tags: ['nodejs', 'express', 'api', 'backend'],
        authorId: 'user_2',
    },
    {
        title: 'The Power of CSS Grid',
        slug: 'the-power-of-css-grid',
        description: 'Unlock complex and responsive layouts with the power of CSS Grid Layout.',
        content: '## Grid vs Flexbox\\n...\\n\\n### Defining Your Grid\\n...',
        tags: ['css', 'layout', 'frontend'],
        authorId: 'user_1',
    },
    {
        title: 'State Management in React',
        slug: 'state-management-in-react',
        description: 'An overview of different state management solutions in the React ecosystem, from Context to Redux.',
        content: '## The `useState` Hook\\n...\\n\\n## The `useReducer` Hook\\n...\\n\\n## Context API\\n...',
        tags: ['react', 'state-management', 'redux'],
        authorId: 'user_2',
    },
    {
        title: 'CI/CD with GitHub Actions',
        slug: 'ci-cd-with-github-actions',
        description: 'Automate your build, test, and deployment workflows with GitHub Actions.',
        content: '## Your First Workflow File\\nCreate a file at `.github/workflows/main.yml`\\n...\\n',
        tags: ['devops', 'ci-cd', 'github'],
        authorId: 'user_1',
    },
    {
        title: 'TypeScript for JavaScript Developers',
        slug: 'typescript-for-javascript-developers',
        description: 'A guide for JavaScript developers looking to adopt TypeScript into their projects.',
        content: '## Why TypeScript?\\n...\\n\\n### Basic Types\\n...',
        tags: ['typescript', 'javascript', 'frontend'],
        authorId: 'user_2',
    },
];

async function main() {
  console.log('Start seeding...');

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Created/updated user with id: ${user.id}`);
  }

  for (const s of snippets) {
    const existingSnippet = await prisma.snippet.findFirst({
        where: { title: s.title },
    });

    if (!existingSnippet) {
        const snippet = await prisma.snippet.create({
            data: s,
        });
        console.log(`Created snippet with id: ${snippet.id}`);
    } else {
        console.log(`Snippet with title "${s.title}" already exists. Skipping.`);
    }
  }

  for (const d of docs) {
    const existingDoc = await prisma.document.findFirst({
        where: { slug: d.slug },
    });

    if (!existingDoc) {
        const document = await prisma.document.create({
            data: d,
        });
        console.log(`Created document with id: ${document.id}`);
    } else {
        console.log(`Document with slug "${d.slug}" already exists. Skipping.`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
