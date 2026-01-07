import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import './Home.css';

const Home = () => {

  useEffect(() => {
    const showCreatorAlert = () => {
      if (!localStorage.getItem('creatorAlertShown')) {
        Swal.fire({
          title: 'Welcome to EV CharFinder',
          html: 'Created by:<br><strong>Aman Maurya</strong> and <strong>Anantkumar Shrivastav</strong>',
          icon: 'info',
          confirmButtonText: 'Got it!',
          timer: 5000
        });
        localStorage.setItem('creatorAlertShown', 'true');
      }
    };

    showCreatorAlert();
  }, []);

  const baseUrl = import.meta.env.BASE_URL;
  const services = [
    {
      id: 1,
      title: 'Search Stations',
      description: 'Find nearby charging stations and check available slots in real-time.',
      icon: 'fas fa-charging-station',
      image: `${baseUrl}images/circle1.jpg`,
      link: '/search',
      delay: 0.1
    },
    {
      id: 2,
      title: 'Finding Route',
      description: 'Search your destination path in the simplest way from your current location.',
      icon: 'fas fa-route',
      image: `${baseUrl}images/route1.jpg`,
      link: '/routing',
      delay: 0.3
    },
    {
      id: 3,
      title: 'Traffic Detector',
      description: 'Get real-time traffic information on your route to the destination.',
      icon: 'fas fa-traffic-light',
      image: `${baseUrl}images/circle3.jpg`,
      link: '/traffic',
      delay: 0.5
    }
  ];

  return (
    <div className="home-page">
      <div className="content-wrapper">
        {/* Hero Section */}
        <section className="hero-section" id="hero-section">
          <div className="container">
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome to EV CharFinder
            </motion.h1>
            <div className="row align-items-center">
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img src={`${baseUrl}images/bg.jpg`} alt="EV Charging" className="img-fluid hero-image" />
              </motion.div>
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="hero-content">
                  <p className="lead mb-4">
                    Electric vehicles help reduce carbon emissions and build a sustainable future. 
                    As drivers, EVs offer much more than just environmental benefits.
                  </p>
                  <div className="features mb-4">
                    <motion.p
                      className="mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <i className="fas fa-bolt mr-2"></i>
                      Superior driving experience with instant torque and smooth handling
                    </motion.p>
                    <motion.p
                      className="mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <i className="fas fa-tools mr-2"></i>
                      Requires less maintenance than conventional ICE vehicles
                    </motion.p>
                    <motion.p
                      className="mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <i className="fas fa-charging-station mr-2"></i>
                      Convenient charging options available everywhere
                    </motion.p>
                  </div>
                  <motion.p
                    className="charging-locations"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Charge your EV at multiple locations:
                    <span className="d-block mt-2">
                      <i className="fas fa-home mr-2"></i>Home
                      <i className="fas fa-building ml-3 mr-2"></i>Office
                      <i className="fas fa-utensils ml-3 mr-2"></i>Restaurants
                      <i className="fas fa-shopping-cart ml-3 mr-2"></i>Shopping Centers
                    </span>
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="section services-section">
          <div className="container">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Services
            </motion.h2>
            <div className="row">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="col-lg-4"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: service.delay }}
                >
                  <div className="feature-card text-center">
                    <img
                      src={service.image}
                      className="rounded-circle mb-4 service-image"
                      alt={service.title}
                    />
                    <i className={`${service.icon} fa-3x mb-4 text-primary`}></i>
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                    <Link
                      to={service.link}
                      className="custom-btn btn"
                    >
                      {service.id === 1 ? 'Search Now' : service.id === 2 ? 'Find Route' : 'Detect Traffic'}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stations Section */}
        <section id="stations" className="section stations-section">
          <div className="container">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Stations
            </motion.h2>
            <div className="row align-items-center">
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p><b>1. Power :</b>
                  Low-carbon energy sources such as wind farms and photovoltaic (PV) systems turn energy from wind
                  or light into the electricity needed to meet the needs of commercial, industrial and
                  residential customers.</p>
                <p>
                  <b>2. Business, Retail and Fleet Charging :</b>
                  Charging whilst parked at work or during leisure activities is a convenient way to recharge.
                </p>
                <p>
                  <b>3. Charging On-the-Go :</b>
                  On forecourts electric fast charging services are developed for drivers who need to recharge
                  their vehicle during their journeys.
                </p>
                <p><b>4. Home charging :</b>
                  Charging at home is often the most convenient and cost effective way for private customers to
                  recharge their cars, as it is where most cars are parked overnight.</p>
              </motion.div>
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img src={`${baseUrl}images/first.jpg`} alt="Stations" className="img-fluid rounded section-image" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ports Section */}
        <section id="ports" className="section ports-section">
          <div className="container">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Available Charging Ports
            </motion.h2>
            <div className="row align-items-center">
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <img src={`${baseUrl}images/stations available.png`} alt="Ports" className="img-fluid rounded section-image" />
              </motion.div>
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p>Level 1 chargers : They are easy to find and use, inexpensive, and reliable. For a single-family home, a Level 1 charger may meet drivers' needs. Level 1 chargers charge at a rate of 4-5 miles per hour. They work best if a driver is able to plug in and let the vehicle charge overnight on a regular basis.</p>
                <p>Since Level 1 chargers are of limited use for those who use their cars often or in apartment buildings, many consumers want a Level 2 charger, which can charge at a rate of 20-65 miles per hour. The plugs for Level 2 chargers are different from plugs for Level 1 chargers and require different cords and equipment than what comes with your new car.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section about-section">
          <div className="container">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              About Us
            </motion.h2>
            <div className="row align-items-center">
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <img src={`${baseUrl}images/about.gif`} alt="About" className="img-fluid rounded section-image" />
              </motion.div>
              <motion.div
                className="col-lg-6"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p>An EV charging station is a device that allows drivers to charge up their electric cars while they're
                  parked at home or work. The station has two main components: A power source and a connector. The
                  power source converts electricity into DC current, which is then converted into AC current using
                  inverters..</p>
                <p>You can search for the nearest charging station from our maps api page and can use it to get navigate
                  it to the place.</p>
                <p className="mt-4"><strong>Project Creators:</strong><br />
                  Aman Maurya<br />
                  Anantkumar Shrivastav</p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

