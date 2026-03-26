# User 
``` bash
User dashboard
    - user can see profile and update
    - user can see all enrolledCourse 
    - user can see all payment recipt and payment details
    - user see progress
    - upload result functionality
    - see downloaded resorces like video,pdf,notes
user activity
    - user can buy new course
```

# admin
```bash
ui for admin dashboard
    - split screen vertical 80% ,20%
    - 20% show all teg -> course,imagesection,payments,user etc
    - 80% show data click on the 20% screen link 
Admin dashboard
    - create video for a specific cetagory (already done) !video delete functionality is not there and update video delete
    - create a cetagory of a specific root (already done) !category delete and update functionality is not done
    - create root directory (already done) 
    - add ,update,delete images UI of the whole website(home section hero image, instructor image,logo, image in about section, director image) for this i have create a api/ImageSection => get image, api/ImageSection/:id => push new imageurl in image Array and delete imageSection.
    - see all user list and update block status and also can delete user (search user by name)
    - create career ,upadte career get career, delete career 
    - see all payments
    - can see total sales on monthly basis
    - create,delete testimonials

```

# Home page

## Navbar
```bash
Logo: default ./logo
Links:
    - Home
    - Result -> /StudentResult
    - About us -> /Aboutus
    - Course -> drop down show all root and root will be dril till cetagory
    - Student Corner -> only login student see , /me
    - contant us -> /contactUs
```
## HeroSection
```bash
fatch image from db(/api/ImageSection/:id) -> render all image of ImagesUrl, alto switpe image next and dot system in bottem of image so that user can see specific image

Course category 

Testimonials auto scroll view in x axis

Top Rankers -> /api/StudentResult (top 5 score result)
```

## footer 
``` bash
Quick Link
    column 1
        - about us
        - career
        - result
        - contact us
    column 2
        -contact us
        - address
        - contact no.
        - email
    column 3
        - contact us
        - input Email
        - input Name
        - submit button
    bottom 
        - copy right@
        - facebook,insta,youtube link icon
```

# Result
```bash
    - serach result by course
    - search result by year
    - serch result by category
    - show all student result in grid pattern in descending order with pagination

```

# About 
```bash
    alredy done
```

# course
```bash
    already done
    minor update
        - video doesn't show youtube logo 
        - when user click on resourse then resorce will be start download for free course
        - when user click on resourse then resorce will be show in spreate page /resourse/page for show pdf file (for paid course ) not downloadable
```

# student corner
```bash
two section split vertical 
    - 80% width for showing enroll corse
        - a navigation with show payments button, paid course, free course
    - 20% width for show profile and edit button to update details(only avatar and username)
```

# contact us -> alredy done



