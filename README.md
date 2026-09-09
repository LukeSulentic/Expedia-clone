# CI/CD for 309 Android/Spring projects 

---
# Setup Once As A Team:

### 0. One of the team members SSH into your server

From your computer, type
```bash
ssh <netid>@coms-3090-<xyz>.class.las.iastate.edu
```

for example ```> ssh smitra@coms-3090-001.class.las.iastate.edu```


### 1. Install GitLab-Runner on your server

Source - https://docs.gitlab.com/runner/install/linux-manually.html

##### Step 1: Simply download one of the binaries for your system
```bash
sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
```

##### Step 2:  Give it permissions to execute
```bash
sudo chmod +x /usr/local/bin/gitlab-runner
```

##### Step 3: Create a GitLab CI user
```bash
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
```

##### Step 4: Provide sudo access to “GitLab Runner”
```bash
sudo usermod -aG proj gitlab-runner
```

##### Step 5: Install and run as service (one command at the time)

```bash
sudo /usr/local/bin/gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo /usr/local/bin/gitlab-runner start
```

Sometimes the gitlab runners are not started. You can try doing
```bash
sudo /usr/local/bin/gitlab-runner run
```

### 2. Install Docker on your server

Source - https://docs.docker.com/engine/install/centos/

##### Step 1: Switch yourself to the root user
```bash
sudo bash
```

##### Step 2: Uninstall the pre-installed Podman on your server
```bash
yum erase podman buildah
```

##### Step 3: Install Docker (one command at the time)

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

##### Step 4: Start Docker service and test if it’s working (one command at the time)
```bash
sudo systemctl start docker
sudo docker run hello-world
```

##### Step 5: Set ulimit for Docker (in case of ‘unable to allocate file descriptor table - out of memory’)
```bash
sudo systemctl edit docker
```
Add following lines (use `ctrl+x` then `y` then `enter` to save and exit the nano editor)
```
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --default-ulimit nofile=65536:65536 -H fd://
```

Note: add the content starting at line#3, in between the comments (**NOT to the end of the file**).

##### Step 6: Restart Docker service

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```


### 3. Install Maven on your server

##### Step 1: Switch yourself to the root user
```bash
sudo bash
```

##### Step 2: Install Maven on your server
```bash
mvn -v
```
- If it’s not installed, follow the instructions (hit `y`) to install maven on your server
- Default Java version used by Maven: 11
- To change the Java version for your Maven:
  - check available jvms on your server: ```ls /usr/lib/jvm```
  - open maven configuration: ```nano /etc/java/maven.conf```
  - replace the value of `JAVA_HOME` to one of the desired JDKs
`ctrl+x` -> `y` -> `enter` to save & quit nano
  - for example: `JAVA_HOME=/usr/lib/jvm/java-17-openjdk`


### 4. Register GitLab Runner

Create 2 GitLab runners as a team – Frontend & Backend.



##### Step 1: Registration Token
- In your team's repository GitLab webpage, navigate to `Settings -> CI/CD -> Runners -> Expand`
- ~~Click on the `3 dots` next to the button `New Project Runner`~~ Registration Token has been deprecated instead click on `New project runner`
- ~~Copy the `registration token`~~ Input tags as defined in instruction below (eg android_tag, springboot_tag, etc)
- Click `create runner`
- You will be taken to a new screen. Follow the instructions here. Copy the command from step 1 in this screen.



##### Step 2: On your server, create a runner for Frontend (Android)
~~sudo /usr/local/bin/gitlab-runner register~~

```bash
sudo /usr/local/bin/<replace_with_the_command_from_earlier>
```

It should be something similar to ``sudo /usr/local/bin/gitlab-runner register --url https://git.las.iastate.edu --token glrt-.........``

- You will be prompted to add a gitlab-ci instance url , enter `https://git.las.iastate.edu/`

- Next you will be prompted to enter the registration token you saved from step.1

- Next enter any description

- Next enter tags, tags are important, as they will be used later to Tie a JOB to a RUNNER, name them appropriately, so it will be easier for you to identify, example:
  -  tag for frontend: `android_tag`

- Finally, you will be asked to select executor, enter 
  - `docker` since this runner will be used for Android
  
- Default Docker image enter `alpine:latest`
  
- Your runner should now be up and running. You can verify this by again navigating to `Settings -> CI/CD -> Runners -> Expand`, you should see an active runner created (green for active), with the specified tags.
- Sometimes the gitlab runners are not started. You can try   `$ sudo /usr/local/bin/gitlab-runner run`

##### Step 3: Fix config.toml file
```bash
sudo bash
cd /etc/gitlab-runner
```

Open `config.toml`
```bash
nano config.toml
```
 
Under `[runners.docker]` append the line (`ctrl+x`+`y`+`enter` to save & quit nano)
```
network_mode = "host"
```

Restart gitlab runner
```bash
sudo systemctl restart gitlab-runner.service
```

##### Step 4: On your server, create a runner for Backend (Springboot)

##### Make sure that Backend uses JDK 11 - 17!

~~sudo /usr/local/bin/gitlab-runner register~~
Same as the isntructions above for froentend and backend
```bash
sudo /usr/local/bin/<replace_with_the_command_from_earlier>
```

It should be something similar to ``sudo /usr/local/bin/gitlab-runner register --url https://git.las.iastate.edu --token glrt-.........``

- You will be prompted to add a gitlab-ci instance url, enter `https://git.las.iastate.edu/`

- Next you will be prompted to enter the registration token you saved from step.1

- Next enter any description

- Next enter tags, tags are important, as they will be used later to Tie a JOB to a RUNNER, name them appropriately, so it will be easier for you to identify, example:
  -  tag for backend: `springboot_tag`

- Finally, you will be asked to select executor, enter 
  - `shell` since this runner will be used for Springboot
    
- Your runner should now be up and running. You can verify this by again navigating to `Settings -> CI/CD -> Runners -> Expand`, you should see an active runner created (green for active), with the specified tags.
- Sometimes the gitlab runners are not started. You can try   `$ sudo /usr/local/bin/gitlab-runner run`


### 5. Create a Linux service to handle deployment (CD)

##### Step 1: creates a folder named 'target' in your root directory
```bash
sudo mkdir /target
```

##### Step 2: makes the folder writable to all
```bash
sudo chmod 777 /target
```

##### Step 3: create a service file
```bash
cd /usr/lib/systemd/system
sudo nano system-web-demo.service
```

##### Step 4: add following lines to the file (`ctrl+x`->`y`->`enter` to save & quit nano)
```
[Unit]
Description=web demo service
After=network.target
 
[Service]
ExecStart=/usr/bin/java -jar /target/web-demo.jar   
User=gitlab-runner
Group=proj
 
[Install]
WantedBy=multi-user.target
```

##### Step 5: Enable the service
```bash
sudo systemctl enable system-web-demo.service
```

### 6. Add .gitlab-ci.yml to your Main branch

 ##### Step 1: 
 At the top level of your `main` branch (the level where you have the frontend/backend folders), create a new file `.gitlab-ci.yml` (includes the dot)
  - you can do this either by creating the file on your local repository and push it to your main branch
  - or simply use the web interface of Gitlab to create a new file
  
##### Step 2:
Edit the `.gitlab-ci.yml` file in your `main branch`. example content:

```yaml
stages:             # these stages (jobs) forms the CICD pipeline
  - mavenbuild      # this is a JOB to build your Springboot application
  - maventest       # this is a JOB to run tests in your Springboot application (it's okay you don't have any test for now)
  - mavendeploy     # this is a JOB to deploy your Springboot application on your server
  - androidbuild    # this is a JOB to build your Android application
  - androidtest     # this is a JOB to run tests in your Android application (it's okay you don't have any test for now)

maven-build:            
  stage: mavenbuild     # one of the stages listed above
  tags:                 # to specify which runner to execute this job
    - springboot_tag    # change to your runner's tag
  script:               # what to execute for this job
    - cd Backend        # change 'Backend' to to where you have the pom.xml (do not add / in the beginning)
    - mvn package       # maven package
  artifacts:            # where to output the packaged jar file, change 'Backend' to to where you have the pom.xml
    paths:
    - Backend/target/*.jar # change 'Backend' to where you have 'target' (do not add a / in the beginning)
  only:
    refs:
      - main            # only to trigger the pipeline when changes are pushed to 'main'
    changes:
      - Backend/**/*    # more specifically - only when changes are made inside the 'Backend' folder

maven-test:             
  stage: maventest     # one of the stages listed above
  tags:
     - springboot_tag   # change to your runner's tag
  script:
     - cd Backend       # change 'Backend' to to where you have the pom.xml (do not add / in the beginning)
     - mvn test         # maven test
  only:
    refs:
      - main            # only to trigger the pipeline when changes are pushed to 'main'
    changes:
      - Backend/**/*    # more specifically - only when changes are made inside the 'Backend' folder

auto-deploy:
  stage: mavendeploy    # one of the stages listed above
  tags:
  - springboot_tag      # change to your runner's tag
  script:               # script to run the deployment service you created
    - cd Backend        # change 'Backend' to to where you have the pom.xml (do not add / in the beginning)
    - sudo mv target/*.jar /target/web-demo.jar 
    - sudo systemctl stop system-web-demo
    - sudo systemctl start system-web-demo
  only:
    refs:
      - main            # only to trigger the pipeline when changes are pushed to 'main'
    changes:
      - Backend/**/*    # more specifically - only when changes are made inside the 'Backend' folder

android-build:
  image: afirefly/android-ci:java17 # Docker image that has Android environments installed     gjandres/android-ci:latest
  stage: androidbuild               # one of the stages listed above
  tags:
   - android_tag                    # change to your runner's tag
  before_script:                    # enable gradlew, change 'Frontend' to where you have 'gradlew'
    - export GRADLE_USER_HOME=`pwd`/.gradle
    - chmod +x ./Frontend/gradlew
  script:
    - cd Frontend                   # change 'Frontend' to where you have 'gradlew' (do not add / in the beginning)
    - ./gradlew build               # gradle build
  only:
    refs:
      - main                        # only to trigger the pipeline when changes are pushed to 'main'
    changes:
      - Frontend/**/*               # more specifically - only when changes are made inside the 'Frontend' folder

android-test:
  image: afirefly/android-ci:java17
  stage: androidtest               # one of the stages listed above
  tags:
    - android_tag                   # change to your runner's tag
  before_script:                   # enable gradlew, change 'Frontend' to where you have 'gradlew'
     - export GRADLE_USER_HOME=`pwd`/.gradle
     - chmod +x ./Frontend/gradlew
  script:
     - cd Frontend                  # change 'Frontend' to where you have 'gradlew' (do not add / in the beginning)
     - ./gradlew test               # gradle test
  only:
    refs:
      - main          # only to trigger the pipeline when changes are pushed to 'main'
    changes:
      - Frontend/**/*               # more specifically - only when changes are made inside the 'Frontend' folder
```

##### Step 3:

- On your team's repository, navigate to `Build -> Pipelines`, check to see if the jobs are running, click on each circle in the pipeline to view detailed status of each job.
- If you see green check marks for all stages, this means all stages successfully ran through (Android ones may take a while)
- Once all stages ran through successfully, check whether your Springboot application is deployed on your server by sending requests to it (e.g., from Postman).

---
# Setups by Each Team Member:

### 1. Create a Gitlab runner of your own

##### Step 0: Registration Token
In your team's repository GitLab webpage, navigate to `Settings -> CI/CD -> Runners -> Expand`
~~Click on the `3 dots` next to the button `New Project Runner`~~
~~Copy the `registration token`~~ 
##### **This has been deprecated follow along as the instruction above in Step 1 and 2 of ``4. Register GitLab Runner``**

##### Step 1: ssh into your server

From your computer, type
```bash
ssh <netid>@coms-3090-<xyz>.class.las.iastate.edu
```

for example ```> ssh smitra@coms-309-001.class.las.iastate.edu```

##### Step 2: Create runner of your own
```bash
sudo /usr/local/bin/gitlab-runner register
```

- You will be prompted to add a gitlab-ci instance url, enter `https://git.las.iastate.edu/`

- Next you will be prompted to enter the registration token you saved from `Step 0`

- Next enter any description

- Next enter tags, tags are important, as they will be used later to Tie a JOB to a RUNNER, name them appropriately, so it will be easier for you to identify, example:
  -  tag for your own runner: `yourname_tag`

- Finally, you will be asked to select executor, enter 
  - `shell` if this runner will be used for Springboot
  - `docker` if this runner will be used for Android
  
- Default Docker image enter `alpine:latest` (if this runner will be used for Android)
    
- Your runner should now be up and running. You can verify this by again navigating to `Settings -> CI/CD -> Runners -> Expand`, you should see an active runner created (green for active), with the specified tags.
- Sometimes the gitlab runners are not started. You can try   `$ sudo /usr/local/bin/gitlab-runner run`

### 2. Create a branch with the branch name \<YOURNAME\>_CICD

- Example command if you are creating the branch from the cloned repositoy (local):
```bash
git branch YOURNAME_CICD
```

- Checkout the branch:
```bash
git checkout YOURNAME_CICD
```

### 3. Add/Modify .gitlab-ci.yml in your own branch

**Example if you are working on the backend**
```yaml
stages:
  - mavenbuild
  - maventest
  
maven-build:            
  stage: mavenbuild
  tags:
    - yourname_tag      # <-- change to your runner's tag
  script:
    - cd Backend        # change 'Backend' to to where you have the pom.xml (do not add / in the beginning)
    - mvn package
  only:
    refs:
      - YOURNAME_CICD
    changes:
      - Backend/**/*


maven-test:             
  stage: maventest
  tags:
    - yourname_tag     # <-- change to your runner's tag
  script:
    - cd Backend       # change 'Backend' to to where you have the pom.xml (do not add / in the beginning)
    - mvn test
  only:
    refs:
      - YOURNAME_CICD
    changes:
      - Backend/**/*
```


**Example if you are working on the frontend**
```yaml
stages:
  - androidbuild
  - androidtest 
  
android-build:
  image: afirefly/android-ci:java17
  stage: androidbuild
  tags:
   - yourname_tag                   # <-- change to your runner's tag
  before_script:                    # change 'Frontend' to where you have 'gradlew'
    - export GRADLE_USER_HOME=`pwd`/.gradle
    - chmod +x ./Frontend/gradlew
  script:
    - cd Frontend                   # change 'Frontend' to where you have 'gradlew' (do not add / in the beginning)
    - ./gradlew build
  only:
    refs:
      - YOURNAME_CICD
    changes:
      - Frontend/**/*

android-test:
  image: afirefly/android-ci:java17
  stage: androidtest
  tags:
    - yourname_tag                  # <-- change to your runner's tag
  before_script:                   # change 'Frontend' to where you have 'gradlew'
    - export GRADLE_USER_HOME=`pwd`/.gradle
    - chmod +x ./Frontend/gradlew
  script:
    - cd Frontend                  # change 'Frontend' to where you have 'gradlew' (do not add / in the beginning)
    - ./gradlew test
  only:
    refs:
      - YOURNAME_CICD
    changes:
      - Frontend/**/*
```

### 5. Push to your branch
- Push some updates to your own branch
- On your team's repository, navigate to `Build -> Pipelines`, check to see if the jobs are running, click on each circle in the pipeline to view detailed status of each job.
- If you see green check marks for all stages (2 for your own branch), this means all stages successfully ran through (Android ones may take a while)
- NEVER MERGE THIS BRANCH BACK TO THE MAIN BRANCH!!
