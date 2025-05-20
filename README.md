# Repositori IT PIONIR 2025

## Design

[Figma Link](https://www.figma.com/design/gcOfxYx5Liimxc7BjpMhkT/Kembangku?node-id=0-1&p=f&t=0dfLYVMS0Awkchwv-0)

## How To Run

Install all dependencies and run the development server using this command

- **yarn** (recommended)

  ```
  yarn install
  yarn dev
  ```

- **npm**

  ```
  npm i
  npm run dev
  ```

## Pull & Push Schema

1. Checkout to develop branch
2. Pull origin develop
3. Create a new branch (Please read the rule below this section)
4. Checkout to the new branch
5. Code
6. Commit (Please follow the commit messages rule)
7. Pull origin develop
8. Push origin "your branch name"
9. Create a new pull request to develop branch
10. Done

## Commit message

`<type>: <short_summary>`

- `<type>` :

  - feat: saya menambahkan fitur baru
  - fix: saya memperbaiki fitur

- `<summary>` : buat sejelas mungkin

Contoh: feat: Creating about section

## Folder Structure

```
- public: file public (including assets)
- app : Contain all pages
- src
    - components : all components (layouts, button, navbar, etc)
    - utils : Folder berisi fungsi - fungsi
    - modules: section dari suatu page
    - styles: kumpulan styling css
```

## Aturan Penulisan Variabel / File

- Gunakan **PascalCase** untuk menulis nama komponen / file komponen website
  DefaultLayout.js, Navbar.js
- Gunakan **camelCase** untuk menulis nama variabel / file non komponen
  data.js, dataFaq.js, createdAt, dkk

## Clean Code

- [Learn More](https://github.com/ryanmcdermott/clean-code-javascript)
- [Learn More 2](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29#:~:text=Code%20is%20clean%20if%20it,%2C%20changeability%2C%20extensibility%20and%20maintainability.)
