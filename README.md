<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/eltorio/orbitb-server">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">OrbitDB Server</h3>
<h3 align="center">W.I.P. : NOT WORKING (Yet !)</h3>
  <p align="center">
    This is a proof of concept of a persistent OrbitDB Server.<br />
    The main idea is coming from <a href="https://github.com/orbitdb/orbit-db-pinner/blob/main/README.md">orbit-db-pinner</a>
    <br />
    <a href="https://github.com/eltorio/orbitdb-server"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!--<a href="https://github.com/eltorio/orbitdb-server">View Demo</a>-->
    ·
    <a href="https://github.com/eltorio/orbitdb-server/issues">Report Bug</a>
    ·
    <a href="https://github.com/eltorio/orbitdb-server/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


### Built With

* [Typescript](https://typescriptlang.org/)
* [Node.js](https://nodejs.org/)
* [OrbitDB](https://orbitdb.org/)
* [Express](https://expressjs.com/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## About The Project

This is not a working server, this is a proof of concept for exploring OrbitDB in the browser.  
Immediatly when you think about OrbitDB the problem of the persitence is comming.   
In fact I have a static SPA application calling multiple SaaS services, and I need a communication beetween my connected users.   
OrbitDB seems to be the perfect companion for that.   
But what happens if no one is connected ?
The idea is to host this expressjs server on Heroku and ping from the SPA app…   
Heroku will kill it after 30 min. 


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/eltorio/orbitdb-server.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
2a. For TLS
   ```sh
   #declare two variable each containing a single lined PEM
   export TLS_KEY="-----BEGIN RSA PRIVATE KEY-----\nMI………………………………………=\n-----END RSA PRIVATE KEY-----\n"
   export TLS_CERT="-----BEGIN CERTIFICATE-----\nMII…………………………………………==\n-----END CERTIFICATE-----\n"
   ```
3. Launch
   ```js
   npm run dev;
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/eltorio/orbitdb-server](https://github.com/eltorio/orbitdb-server)

<p align="right">(<a href="#top">back to top</a>)</p>


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/eltorio/orbitdb-server.svg?style=for-the-badge
[contributors-url]: https://github.com/eltorio/orbitdb-server/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/eltorio/orbitdb-server.svg?style=for-the-badge
[forks-url]: https://github.com/eltorio/orbitdb-server/network/members
[stars-shield]: https://img.shields.io/github/stars/eltorio/orbitdb-server.svg?style=for-the-badge
[stars-url]: https://github.com/eltorio/orbitdb-server/stargazers
[issues-shield]: https://img.shields.io/github/issues/eltorio/orbitdb-server.svg?style=for-the-badge
[issues-url]: https://github.com/eltorio/orbitdb-server/issues
[license-shield]: https://img.shields.io/github/license/eltorio/orbitdb-server.svg?style=for-the-badge
[license-url]: https://github.com/eltorio/orbitdb-server/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png