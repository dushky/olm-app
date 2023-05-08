# Installation

1. Node.Js version **14.17** is **required !!!**
2. create ```.env``` file from ```.env.example``` file
3. set ```REACT_APP_API_ENDPOINT``` and ```SCHEMA_ENDPOINT``` variables
   to ```https://"__domain_of_laravel_backend_or_ip_with_port"/graphql```
4. set ```REACT_APP_PUSHER_ENV_KEY``` and ```REACT_APP_PUSHER_ENV_CLUSTER``` variables equivalent to
   the ```PUSHER_APP_KEY``` and ```PUSHER_APP_CLUSTER``` variables in your laravel backend ```.env```
5. set ```REACT_APP_GOOGLE_CLIENT_ID``` to the same value as  ```GOOGLE_CLIENT_ID``` in your laravel backend ```.env```
6. run ```npm install``` to install dependencies from package.json
7. run ```npm run start``` for local development or ```npm run build``` for production
8. if build failed, check if Node.Js version is 14.15
9. if it failed on allocated memory try to increase memory with command ```NODE_OPTIONS=–max-old-space-size=5048```
10. in production don't forget set vhost on /build folder of your built application