# Livestream Director API

## Description
This app allows directors to create an account, modify their favorite camera and movie,
and see other registered directors.

## API Commands
* Create Account: Send a JSON POST request to /directors with the 'livestream_id' param set to your livestream id.
* Modify Account: Send a JSON PUT request to /directors/:your_given_id with the authorization header 'Bearer YourFullName'
* See Directors: Send a GET request to /directors
* See a specific Director: Send a GET request to /directors/:their_id

### Modules
1. Express
2. MongoDB
3. Mongoose
4. Request
5. MD5
