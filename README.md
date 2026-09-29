# Student Portfolio and Academic Management Website

COS 106: Introduction to Web Technologies, Practical Term Project
Joshua Omisakin, BSc Software Engineering, Miva Open University

## Pages

| Page | File | Contents |
| --- | --- | --- |
| Home | `index.html` | Name and photograph, welcome message, navigation menu and biography |
| About Me | `about.html` | Educational background, career aspirations, technical skills, hobbies and interests |
| Projects | `projects.html` | Three projects with descriptions, screenshots and links, a video walkthrough, and live work |
| Academic Planner | `planner.html` | Add tasks, mark them as completed, delete them and filter the list |
| Contact | `contact.html` | Name, email address, phone number and message, validated with JavaScript |

## HTML

Semantic elements (`header`, `nav`, `main`, `section`, `article`, `figure`, `footer`), forms, a table, images, hyperlinks, lists and a `video` element.

## CSS

One external stylesheet in `css/style.css`, with a responsive layout built on Flexbox and CSS Grid, styled navigation, transitions and keyframe animations, a single colour scheme, and a mobile menu for small screens.

## JavaScript

* `js/main.js`: navigation, mobile menu, button effects, scroll reveals, rotating headline, scroll progress pen and back to top button.
* `js/planner.js`: the task manager, built on an array of task objects and saved to `localStorage`.
* `js/contact.js`: contact form validation for empty fields, email format and digits only phone numbers.
* `js/toolkit.js`: the moving technical skills field on the About page.

## Running locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```
