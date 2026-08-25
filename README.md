# Druze Connect Hub

Australian Druze Community Platform

Build a modern, mobile-first community platform called Australian Druze Community (ADC).

The platform should be designed as a private members community serving approximately 600 families.

Use a clean, modern UI with white backgrounds, soft shadows, rounded cards and a professional community-focused design.

Colour System

Use the following navigation colour scheme throughout the platform:

 Home = Green (#0E8A4A)

 Events = Red (#E53935)

 Directory = Yellow (#F4B400)

 Groups = Blue (#2962FF)

 More = White with black outline

The design should feel modern, welcoming, trustworthy and community-focused.

Authentication

Create:

Login Screen

Fields:

 Email

 Password

Buttons:

 Login

 Forgot Password

 Register

Registration Screen

Fields:

 First Name

 Last Name

 Email

 Mobile

 Suburb

 Password

 Confirm Password

Checkbox:

 Agree to Terms & Privacy Policy

Button:

 Create Account

Main Application Structure

Create a bottom navigation bar with 5 items:

🏠 Home

📅 Events

👥 Directory

👨‍👩‍👧‍👦 Groups

⋯ More

Navigation must remain fixed at the bottom of the screen.

Home Dashboard

Create a modern dashboard that acts as the digital front door of the community.

Include:

Welcome Header

Australian Druze Community

Subheading:

"Stay connected. Stay informed. Stay involved."

Notification icon in top right.

Featured Event Banner

Large hero card displaying:

 Event image

 Event title

 Date

 Location

 RSVP button

Example:

Family Picnic 2026

Quick Access Cards

6 cards:

 Events

 Directory

 Groups

 Businesses

 Volunteer

 Donate

Use icons and modern cards.

Community Announcements

Card showing latest community announcement.

Example:

"Youth Committee meeting this Sunday at 3PM"

Upcoming Events

Display 3 upcoming events.

Each event should show:

 Date

 Title

 Time

 Location

Latest Posts

Display recent posts from groups.

Example:

Youth Committee

Religious Committee

Women's Committee

Community Statistics

Display:

 Total Members

 Upcoming Events

 Local Businesses

 Volunteers

Use coloured statistic cards.

Database Preparation

Create Supabase tables:

members

 id

 first_name

 last_name

 email

 mobile

 suburb

 profile_photo

 created_at

events

 id

 title

 description

 date

 location

 image

 capacity

announcements

 id

 title

 content

 created_at

groups

 id

 name

 description

 icon

businesses

 id

 business_name

 category

 logo

 description

 phone

 email

 website

Requirements

 Mobile first

 Responsive

 Modern card layout

 Use placeholder images

 Use Supabase for authentication and database

 Generate realistic sample data

 Build working navigation between screens

 Focus on clean UI and production-quality code

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/748c2ed2-42a7-4d66-b65d-8ad1aadddfbc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
