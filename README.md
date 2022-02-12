# Base structure of pythia
```bash
├── pythia
│   ├── client
│   │   ├── src
│   │   │   ├── assets
│   │   │   ├── components
│   │   │   ├── helperFunctions
│   │   │   ├── plugins
│   │   │   ├── router
│   │   │   ├── services
│   │   │   ├── store
│   │   │   └── views
│   ├── server
│   │   ├── pythia
│   │   │   ├── CustomExceptions
│   │   │   ├── HelperFunctions
│   │   │   ├── Models
│   │   │   ├── Parsing
│   │   │   └── Resources
│   └── templates
```

# Prerequisites
Before running pythia, you have to ensure, that the following dependencies are installed. 

# Required Dependencies
- Zeek (https://docs.zeek.org/en/master/install.html)
- pythia_plugin (https://github.com/B4n4n4j0e/pythia_plugin)
	- ./configure --zeek-dist=/path/to/zeek/dist && make
	- zeek -N | grep PYTHIA
- Python 3.9 or higher
- pip3 20.3.4 or higher
- install npm 6.14.4 or higher
- Git

# Zeek configuration



# How to install for development
If you don't want to setup a proxy for development, just download and install the branch no_proxy. In this branch the flask_cors extension is used for the backend, which makes cross-origin AJAX possible.

## Front and Backend 
- Step 1: Install required dependencies
- Step 2: Clone git repository

## Backend
- Step 1: copy templates/env.txt to pythia/server/pythia/.env
Edit the .env file with the required information:

|Entry				              | Description|
| --------------------------|-----------|
|PYTHIA_CONFIG=''				    | Keep empty |
|PYTHIA_PCAP_CONFIG=''			| Keep empty |
|PYTHIA_PATH=''					    | Path where the sensor databases will be stored|
|PYTHIA_PCAP_PATH=''				| Path where the pcap databases will be stored|
|PYTHIA_UPLOAD_PATH=''			| Path of upload path for pcap files|
|ZEEK_PLUGIN_PATH=''				| Path to pythia_plugin/build directory|
|ZEEK_LOCATION=''				    | Path to zeek installation|
|PYTHIA_ZEEK_MODE="sensor"	| Keep value sensor|
	
- Step 4 Switch to directory pythia/server`
- Step 5 (Optional): Create virtual environment: ``` python3 -m venv ./venv``` 
- Step 6 (Optional): Activate virtual environment: ```source venv/bin/activate```
- Step 7 Run the command ```pip3 -r requirements.txt```
- Step 8 For debugging purposes I would recommend to go to pythia/server/run.py and change the line ```app.run()``` to ```app.run(debug)```
- Step 9 Run the application with ```python3 run.py```

## Frontend
- Step 1: Switch to directory client and run 
```npm install```
- Step 2: Switch directory to client and run 
		```npm run serve``` 
		which compiles and hot relaods for development


# How to install for production

- Step 1: Install required dependencies
- Step 2: Install python3-dev python3-venv nginx
- Step 3: Clone git repository
- Step 4: Install python3-dev python3-venv nginx
- Step 5: Switch to directory /pythia/client and run 
```npm install```
- Step 6 Enter command
```npm run build``` 
		which compiles and minifies for production
- Step 7 Copy /pythia/template/pythia.ini to /pythia/server
- Step 8: Create Service user 
	```useradd -r pythia_user -s /bin/false ```
- Step 9: Edit /pythia/template/pythia.service according to your configuration 
- Step 10: Move /pythia/template/pythia.service to /etc/systemd/system/pythia.service
- Step 11:  ```sudo systemctl start```
- Step 12: ```sudo systemctl status pythia```
	- You can check if pythia.sock is created in the WorkingDirectory path and if the service is running
- Step 13: Enter the command ```sudo systemctl enable pythia`` to enable the service

## Setting up nginx
- Step 1: Edit /pythia/template/nginx_pythia according to your configuration
- Step 2: Move /pythia/template/nginx_pythia to /etc/nginx/sites-available
- Step 3: Create link ```sudo ln -s /etc/nginx/sites-available/survey /etc/nginx/sites-enabled ```
- Step 3: Create firewall permission for nginx``` sudo ufw allow 'Nginx Full' ```
- Step 4: Restart nginx service``` sudo systemctl restart nginx ```

## Source for production installation
https://stackabuse.com/single-page-apps-with-vue-js-and-flask-deployment
