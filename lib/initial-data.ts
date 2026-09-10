// Centralized Initial Courses for IMD Capacity Building & Learning Management System (SARTHI)
// Aligned with SIH 2026 Problem Statement 135410

export const INITIAL_COURSES = [
  {
    "id": "course_ai_nwp_modeling",
    "title": "AI & Deep Learning for Numerical Weather Prediction (NWP)",
    "slug": "ai-ml-numerical-weather-prediction",
    "description": "Master the frontier of modern meteorological forecasting through Artificial Intelligence, Deep Learning, and Physics-Informed Neural Networks (PINNs). As high-resolution atmospheric simulations demand unprecedented compute, AI-driven downscaling and surrogate modeling provide meteorologists with real-time precipitation nowcasting and ensemble forecast generation.\n\nThis advanced capacity-building program is engineered specifically for IMD research scientists, weather modelers, and computational meteorologists. You will learn to bridge classical fluid dynamic equations (Navier-Stokes) with modern deep learning architectures including Fourier Neural Operators (FNOs), Graph Neural Networks (GNNs), and Vision Transformers applied to spatial weather grids.\n\nKey Learning Outcomes:\n\u2022 Physics-Informed Neural Networks (PINNs) for atmospheric flow modeling.\n\u2022 Ensemble Weather Forecasting and probabilistic uncertainty quantification.\n\u2022 Real-time Radar & Satellite data assimilation into High-Performance Computing (HPC) pipelines.\n\u2022 WRF (Weather Research and Forecasting) model coupling with deep learning surrogate models.\n\u2022 Operational Deployment on IMD HPC clusters (Pratyush / Mihir standards).",
    "shortDescription": "Master physics-informed neural networks (PINNs), ensemble forecast downscaling, and HPC workflows for next-generation weather prediction at IMD.",
    "category": "Artificial Intelligence",
    "categoryId": "cat_artificial_intelligence",
    "level": "Intermediate to Advanced",
    "thumbnail": "/courses/ai-ml-weather-prediction.png",
    "thumbnailIcon": "cpu",
    "thumbnailColor": "#064E3B",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "AI & HPC FLAGSHIP",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 342,
    "reviewCount": 342,
    "studentsEnrolled": 1240,
    "totalDuration": 3200,
    "metaTitle": "AI & Deep Learning for Numerical Weather Prediction | IMD SARTHI",
    "metaDescription": "Master physics-informed neural networks (PINNs) and HPC workflows for next-generation weather prediction at IMD.",
    "instructorId": "inst_arvind_sharma",
    "instructor": {
      "id": "inst_arvind_sharma",
      "name": "Dr. Arvind K. Sharma",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Scientist 'G' and Head of Numerical Weather Modeling, leading AI and high-performance computing initiatives across MoES institutions.",
      "headline": "Scientist 'G' \u2022 Head, NWP Division",
      "company": "India Meteorological Department (IMD)"
    },
    "curriculum": [
      {
        "id": "mod_ai_1",
        "title": "Module 1: Atmospheric Dynamics & Mathematical Foundations",
        "description": "Governing equations of atmosphere, Navier-Stokes, and primitive equation models.",
        "lessons": [
          {
            "id": "les_ai_1_1",
            "title": "Overview of NWP Frameworks & IMD HPC Ecosystem",
            "duration": "35 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_ai_1_2",
            "title": "Discretization of Primitive Atmospheric Equations",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 2
          },
          {
            "id": "les_ai_1_3",
            "title": "Data Assimilation: 3D-Var and 4D-Var Fundamentals",
            "duration": "45 mins",
            "isFreePreview": false,
            "orderNumber": 3
          }
        ]
      },
      {
        "id": "mod_ai_2",
        "title": "Module 2: Physics-Informed Neural Networks (PINNs)",
        "description": "Integrating physics loss constraints into convolutional and transformer architectures.",
        "lessons": [
          {
            "id": "les_ai_2_1",
            "title": "Formulating Conservation Laws as Neural Loss Functions",
            "duration": "50 mins",
            "isFreePreview": true,
            "orderNumber": 4
          },
          {
            "id": "les_ai_2_2",
            "title": "Fourier Neural Operators (FNO) for Spatial Grids",
            "duration": "45 mins",
            "isFreePreview": false,
            "orderNumber": 5
          },
          {
            "id": "les_ai_2_3",
            "title": "Extreme Precipitation Nowcasting with Diffusion Models",
            "duration": "55 mins",
            "isFreePreview": false,
            "orderNumber": 6
          }
        ]
      },
      {
        "id": "mod_ai_3",
        "title": "Module 3: Operational Pipeline & Verification",
        "description": "Deploying models in production, threat score evaluation, and bias correction.",
        "lessons": [
          {
            "id": "les_ai_3_1",
            "title": "Equitable Threat Score (ETS) & Reliability Diagrams",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 7
          },
          {
            "id": "les_ai_3_2",
            "title": "HPC Cluster Deployment & Real-time Inference",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 8
          }
        ]
      }
    ]
  },
  {
    "id": "course_dwr_nowcasting",
    "title": "Doppler Weather Radar (DWR) Operations & Severe Weather Nowcasting",
    "slug": "doppler-weather-radar-nowcasting",
    "description": "Doppler Weather Radars form the tactical frontline of urban disaster mitigation and localized severe weather warnings. This competency course covers operational radar meteorology, signal characteristics of S-band and C-band radar networks, and advanced diagnostic interpretation of severe convective events.\n\nForecasters will master the analysis of radar reflectivity (Z), radial velocity (V), and spectrum width (W), alongside dual-polarization parameters including differential reflectivity (ZDR) and correlation coefficient (CC) to distinguish hail, heavy precipitation, and non-meteorological echoes.\n\nKey Learning Outcomes:\n\u2022 Operation and scan strategies for S-band and C-band Doppler Weather Radars.\n\u2022 Identification of severe storm signatures: Hook echoes, Bounded Weak Echo Regions (BWER), and Bow Echoes.\n\u2022 Dual-polarization hydrometeor classification (rain vs. hail vs. biological targets).\n\u2022 Velocity Azimuthal Display (VAD) interpretation for vertical wind shear analysis.\n\u2022 Real-time Nowcasting protocols within a 0\u20136 hour tactical warning window.",
    "shortDescription": "End-to-end operational competency on S/C-band Doppler Weather Radars, reflectivity interpretation, VAD profiles, and severe storm nowcasting.",
    "category": "Radar & Satellite",
    "categoryId": "cat_radar_satellite",
    "level": "Intermediate",
    "thumbnail": "/courses/doppler-radar-nowcasting.png",
    "thumbnailIcon": "radio",
    "thumbnailColor": "#0284C7",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "OPERATIONAL LAB",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 285,
    "reviewCount": 285,
    "studentsEnrolled": 980,
    "totalDuration": 2800,
    "metaTitle": "Doppler Weather Radar Operations & Nowcasting | IMD SARTHI",
    "metaDescription": "Operational competency training on Doppler Weather Radars and convective storm nowcasting for IMD forecasters.",
    "instructorId": "inst_meenakshi",
    "instructor": {
      "id": "inst_meenakshi",
      "name": "Dr. Meenakshi Sundaram",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Senior Radar Meteorologist with 18+ years directing operational radar networks and extreme thunderstorm nowcasting at IMD.",
      "headline": "Director, Radar Meteorology Operations",
      "company": "National Weather Forecasting Centre (NWFC)"
    },
    "curriculum": [
      {
        "id": "mod_dwr_1",
        "title": "Module 1: Radar Physics & Dual-Polarization Hardware",
        "description": "Pulse transmission, Doppler dilemma, Nyquist velocity, and dual-polarimetric variables.",
        "lessons": [
          {
            "id": "les_dwr_1_1",
            "title": "Principles of Doppler Radar & Volume Coverage Patterns",
            "duration": "30 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_dwr_1_2",
            "title": "Dual-Polarization: ZDR, KDP, and RhoHV Interpretation",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 2
          },
          {
            "id": "les_dwr_1_3",
            "title": "Attenuation Correction & Velocity De-aliasing Algorithms",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 3
          }
        ]
      },
      {
        "id": "mod_dwr_2",
        "title": "Module 2: Severe Convective Storm Signatures",
        "description": "Real-world case studies of mesocyclones, microbursts, and squall lines.",
        "lessons": [
          {
            "id": "les_dwr_2_1",
            "title": "Detecting Tornado Vortex Signatures (TVS) & Mesocyclones",
            "duration": "45 mins",
            "isFreePreview": true,
            "orderNumber": 4
          },
          {
            "id": "les_dwr_2_2",
            "title": "Hail Detection Algorithms & Vertically Integrated Liquid (VIL)",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 5
          },
          {
            "id": "les_dwr_2_3",
            "title": "Downbursts, Gust Fronts, and Airport Wind Shear Warnings",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 6
          }
        ]
      }
    ]
  },
  {
    "id": "course_insat_satellite_met",
    "title": "Satellite Meteorology: INSAT-3D/3DR Multispectral Imagery Analysis",
    "slug": "satellite-meteorology-insat-3d",
    "category": "Radar & Satellite",
    "categoryId": "cat_radar_satellite",
    "description": "Geostationary and polar-orbiting satellites provide continuous surveillance of weather phenomena across oceanic and land regions. This course equips meteorological personnel with operational skills in processing, interpreting, and applying satellite datasets from India's indigenous INSAT-3D, 3DR, and 3DS constellations.\n\nParticipants explore visible, thermal infrared, and water vapor channel characteristics, multispectral RGB composite generation (Day Microphysics, Night Microphysics, Natural Color), and quantitative product validation including Sea Surface Temperatures (SST), Outgoing Longwave Radiation (OLR), and Cloud Motion Vectors (CMVs).\n\nKey Learning Outcomes:\n\u2022 Satellite orbits, sensors, and resolution tradeoffs (Spatial, Spectral, Temporal, Radiometric).\n\u2022 Multispectral RGB Composite analysis for fog, low clouds, convective initiation, and dust storms.\n\u2022 Sounder retrieval profiles: Atmospheric temperature and moisture sounding.\n\u2022 Advanced Dvorak Technique (ADT) for tropical cyclone intensity estimation.\n\u2022 Integration with GIS frameworks for disaster warning bulletins.",
    "shortDescription": "Advanced interpretation of multispectral satellite feeds from INSAT-3D/3DR/3DS, cloud-motion vectors, infrared sounders, and Dvorak cyclogenesis estimation.",
    "level": "Beginner to Intermediate",
    "thumbnail": "/courses/satellite-meteorology-insat.png",
    "thumbnailIcon": "globe",
    "thumbnailColor": "#D97706",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "ISRO & IMD ALIGNED",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.8,
    "ratingCount": 218,
    "reviewCount": 218,
    "studentsEnrolled": 820,
    "totalDuration": 2700,
    "metaTitle": "Satellite Meteorology: INSAT-3D/3DR Analysis | IMD SARTHI",
    "metaDescription": "Certified satellite meteorology curriculum covering INSAT-3D/3DR imagery, sounders, and Dvorak cyclone analysis.",
    "instructorId": "inst_rajesh_nair",
    "instructor": {
      "id": "inst_rajesh_nair",
      "name": "Prof. Rajesh V. Nair",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Senior Satellite Applications Specialist collaborating with ISRO and IMD on geostationary payload product calibration and validation.",
      "headline": "Chief Scientist \u2022 Satellite Applications Division",
      "company": "Space Applications Centre & IMD"
    },
    "curriculum": [
      {
        "id": "mod_sat_1",
        "title": "Module 1: Orbital Physics & INSAT Payloads",
        "description": "Geostationary vs Polar orbits, Imager and Sounder specifications.",
        "lessons": [
          {
            "id": "les_sat_1_1",
            "title": "INSAT-3D/3DR/3DS Architecture & Spectral Channels",
            "duration": "30 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_sat_1_2",
            "title": "Channel Physics: Visible, Shortwave IR, Thermal IR, Water Vapor",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 2
          }
        ]
      },
      {
        "id": "mod_sat_2",
        "title": "Module 2: Standard RGB Products & Synoptic Analysis",
        "description": "WMO standard RGB composite rendering and synoptic application.",
        "lessons": [
          {
            "id": "les_sat_2_1",
            "title": "Day Microphysics & Night Fog RGB Generation",
            "duration": "45 mins",
            "isFreePreview": true,
            "orderNumber": 3
          },
          {
            "id": "les_sat_2_2",
            "title": "Dvorak Technique for Tropical Cyclone Intensity (T-Numbers)",
            "duration": "50 mins",
            "isFreePreview": false,
            "orderNumber": 4
          }
        ]
      }
    ]
  },
  {
    "id": "course_agromet_gkms",
    "title": "Agro-Meteorological Advisory Services (GKMS) & Microclimate Modeling",
    "slug": "agrometeorology-gkms-advisories",
    "category": "Agro & Climate",
    "categoryId": "cat_agro_climate",
    "description": "Weather variability is the single largest factor influencing agricultural yields in India. The Gramin Krishi Mausam Sewa (GKMS) scheme by IMD bridges science and rural farming through block-level and district-level weather advisories, protecting millions of farming livelihoods.\n\nThis course builds core competencies in translating meteorological forecasts into high-impact agronomic advisories, soil water balance modeling, pest and disease weather forecasting, and microclimate risk mitigation for diverse agro-climatic zones across India.\n\nKey Learning Outcomes:\n\u2022 Structure and mandate of Gramin Krishi Mausam Sewa (GKMS) and District Agromet Units (DAMUs).\n\u2022 Reference Crop Evapotranspiration (ETo) computation and soil water deficit accounting.\n\u2022 Thermal indices (Growing Degree Days, Photo-Thermal Units) and crop phenology tracking.\n\u2022 Weather-based pest and disease early warning models.\n\u2022 Preparation and dissemination of bilingual Agromet Advisory Bulletins via mobile & community networks.",
    "shortDescription": "Practical competency training on district-level Agromet advisories under Gramin Krishi Mausam Sewa, soil moisture monitoring, and drought vulnerability.",
    "level": "Beginner to Intermediate",
    "thumbnail": "/courses/agrometeorology-gkms-advisories.png",
    "thumbnailIcon": "sprout",
    "thumbnailColor": "#15803D",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "RURAL IMPACT \u2022 GKMS",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 310,
    "reviewCount": 310,
    "studentsEnrolled": 1450,
    "totalDuration": 2500,
    "metaTitle": "Agro-Meteorological Advisory Services (GKMS) | IMD SARTHI",
    "metaDescription": "Professional training for Agromet scientists on GKMS bulletin generation and climate risk mitigation.",
    "instructorId": "inst_sunita_deshmukh",
    "instructor": {
      "id": "inst_sunita_deshmukh",
      "name": "Dr. Sunita Deshmukh",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Principal Scientist at the Agricultural Meteorology Division, Pune, with 20+ years expertise in crop-weather modeling and farmer advisory networks.",
      "headline": "Principal Scientist \u2022 Agricultural Meteorology Division",
      "company": "IMD Pune & ICAR"
    },
    "curriculum": [
      {
        "id": "mod_agro_1",
        "title": "Module 1: Agro-Meteorological Framework & DAMU Network",
        "description": "Institutional setup of GKMS, data gathering from AWS/ARG stations.",
        "lessons": [
          {
            "id": "les_agro_1_1",
            "title": "Overview of GKMS Mandate & Block-Level Forecasting",
            "duration": "30 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_agro_1_2",
            "title": "Penman-Monteith Evapotranspiration & Soil Water Deficit",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 2
          }
        ]
      },
      {
        "id": "mod_agro_2",
        "title": "Module 2: Practical Advisory Generation",
        "description": "Authoring crop-specific action alerts for irrigation, fertilizer, and pest sprays.",
        "lessons": [
          {
            "id": "les_agro_2_1",
            "title": "Growing Degree Days (GDD) & Phenological Forecasting",
            "duration": "35 mins",
            "isFreePreview": true,
            "orderNumber": 3
          },
          {
            "id": "les_agro_2_2",
            "title": "Drafting High-Impact District Agromet Bulletins",
            "duration": "45 mins",
            "isFreePreview": false,
            "orderNumber": 4
          }
        ]
      }
    ]
  },
  {
    "id": "course_aviation_meteorology",
    "title": "Aviation Meteorology & Aerodrome Forecasting Standards",
    "slug": "aviation-meteorology-icao-wmo",
    "category": "Aviation & Marine",
    "categoryId": "cat_aviation_marine",
    "description": "Aviation safety is fundamentally contingent upon accurate, timely, and universally standardized weather reporting. Aerodrome Meteorological Offices (AMOs) and Aeronautical Meteorological Stations (AMSs) at Indian airports operate under strict World Meteorological Organization (WMO-No. 49) and International Civil Aviation Organization (ICAO Annex 3) mandates.\n\nThis certified course provides essential competency verification for aviation weather observers and forecasters, covering standard coded messages (METAR, SPECI, TAF, SIGMET), Runway Visual Range (RVR) sensor operations, low-level wind shear detection, and clear-air turbulence (CAT) diagnosis.\n\nKey Learning Outcomes:\n\u2022 Standards and regulations under ICAO Annex 3 and WMO-No. 49 / WMO-No. 258.\n\u2022 Encoding and decoding of METAR, SPECI, TAF, TREND, and SIGMET bulletins.\n\u2022 Runway Visual Range (RVR) measurement systems and transmissometer calibration.\n\u2022 Aviation weather hazards: Microbursts, low-level wind shear (LLWS), mountain waves, and icing.\n\u2022 Aerodrome warning issuance for airport ground operations during severe squalls and thunderstorms.",
    "shortDescription": "Certified competency training for airport forecasters covering METAR/SPECI coding, TAF generation, wind shear alerts, and RVR protocols.",
    "level": "Advanced",
    "thumbnail": "/courses/aviation-meteorology-icao.png",
    "thumbnailIcon": "plane",
    "thumbnailColor": "#4338CA",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "ICAO & WMO ALIGNED",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 195,
    "reviewCount": 195,
    "studentsEnrolled": 610,
    "totalDuration": 2900,
    "metaTitle": "Aviation Meteorology Standards (ICAO/WMO) | IMD SARTHI",
    "metaDescription": "Official competency course for aviation meteorological personnel adhering to ICAO Annex 3.",
    "instructorId": "inst_vikram_sen",
    "instructor": {
      "id": "inst_vikram_sen",
      "name": "Capt. Vikramaditya Sen",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Aeronautical Meteorology Specialist and former ICAO Aviation Meteorology Taskforce panelist with 25+ years in international aviation safety.",
      "headline": "Senior Consultant \u2022 Aeronautical Meteorological Services",
      "company": "Civil Aviation Training College & IMD"
    },
    "curriculum": [
      {
        "id": "mod_av_1",
        "title": "Module 1: International Regulatory Framework & Coding",
        "description": "ICAO Annex 3, WMO-No. 49 regulations, and airport operational categories.",
        "lessons": [
          {
            "id": "les_av_1_1",
            "title": "Regulatory Structure of Aeronautical Meteorological Services",
            "duration": "35 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_av_1_2",
            "title": "METAR & SPECI: Precise Coding Rules & Remark Fields",
            "duration": "45 mins",
            "isFreePreview": false,
            "orderNumber": 2
          },
          {
            "id": "les_av_1_3",
            "title": "Terminal Aerodrome Forecasts (TAF) & TREND Issuance",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 3
          }
        ]
      },
      {
        "id": "mod_av_2",
        "title": "Module 2: In-Flight & Terminal Hazardous Phenomena",
        "description": "Diagnosing turbulence, structural icing, volcanic ash, and low-level wind shear.",
        "lessons": [
          {
            "id": "les_av_2_1",
            "title": "Low-Level Wind Shear (LLWS) Detection & Warning Systems",
            "duration": "40 mins",
            "isFreePreview": true,
            "orderNumber": 4
          },
          {
            "id": "les_av_2_2",
            "title": "Runway Visual Range (RVR) Operations in Low Visibility",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 5
          },
          {
            "id": "les_av_2_3",
            "title": "SIGMET & AIRMET Issuance for Hazardous Weather",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 6
          }
        ]
      }
    ]
  },
  {
    "id": "course_tropical_cyclone_early_warning",
    "title": "Tropical Cyclone Early Warning Systems & Coastal Risk Mitigation",
    "slug": "tropical-cyclone-warning-systems",
    "category": "Disaster Management",
    "categoryId": "cat_disaster_management",
    "description": "The North Indian Ocean (Bay of Bengal and Arabian Sea) experiences some of the deadliest tropical cyclonic storms globally. IMD serves as the designated Regional Specialized Meteorological Centre (RSMC) for Tropical Cyclones under WMO, responsible for issuing tropical weather advisories to 13 member countries.\n\nThis flagship disaster mitigation course delivers intensive training on cyclone genesis detection, track forecast numerical modeling, intensity estimation, storm surge computational simulation, and coordinated emergency communication with the National Disaster Management Authority (NDMA).\n\nKey Learning Outcomes:\n\u2022 Tropical cyclogenesis dynamics in the Bay of Bengal & Arabian Sea basins.\n\u2022 Multi-model ensemble track prediction and Cone of Uncertainty generation.\n\u2022 Storm surge computational modeling and astronomical tide superposition.\n\u2022 IMD 4-Stage Cyclone Alert System (Pre-Cyclone Watch, Cyclone Alert, Cyclone Warning, Post-Landfall Outlook).\n\u2022 Impact-based forecasting and coordination with NDRF, Coast Guard, and state disaster relief commissioners.",
    "shortDescription": "Standard Operating Procedures (SOPs) for cyclogenesis tracking, storm surge modeling, color-coded warning dissemination, and NDMA coordination.",
    "level": "Intermediate to Advanced",
    "thumbnail": "/courses/tropical-cyclone-warning.png",
    "thumbnailIcon": "shield-alert",
    "thumbnailColor": "#B91C1C",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "EARLY WARNING \u2022 RSMC",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 412,
    "reviewCount": 412,
    "studentsEnrolled": 1680,
    "totalDuration": 3100,
    "metaTitle": "Tropical Cyclone Early Warning Systems | IMD SARTHI",
    "metaDescription": "RSMC New Delhi standard training on tropical cyclone tracking, storm surge modeling, and emergency warnings.",
    "instructorId": "inst_pradeep_bhattacharya",
    "instructor": {
      "id": "inst_pradeep_bhattacharya",
      "name": "Dr. Pradeep Bhattacharya",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Senior Forecaster at Cyclone Warning Division (CWD), RSMC New Delhi, leading track prediction for Super Cyclones and Very Severe Cyclonic Storms.",
      "headline": "Lead Cyclone Forecaster \u2022 RSMC New Delhi",
      "company": "Cyclone Warning Division, IMD"
    },
    "curriculum": [
      {
        "id": "mod_cyc_1",
        "title": "Module 1: Cyclogenesis & Track Prediction",
        "description": "Atmospheric thermodynamics, shear, Coriolis force, and numerical track ensemble suites.",
        "lessons": [
          {
            "id": "les_cyc_1_1",
            "title": "Climatology of Tropical Cyclones in the North Indian Ocean",
            "duration": "35 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_cyc_1_2",
            "title": "Ensemble Track Modeling & Probability of Landfall Cones",
            "duration": "45 mins",
            "isFreePreview": false,
            "orderNumber": 2
          },
          {
            "id": "les_cyc_1_3",
            "title": "Rapid Intensification (RI) Indicators & Oceanic Heat Content",
            "duration": "40 mins",
            "isFreePreview": false,
            "orderNumber": 3
          }
        ]
      },
      {
        "id": "mod_cyc_2",
        "title": "Module 2: Storm Surge & Impact Warning Protocols",
        "description": "Coastal inundation models and multi-tier warning communication.",
        "lessons": [
          {
            "id": "les_cyc_2_1",
            "title": "IIT-D Storm Surge Model & Coastal Bathymetry Coupling",
            "duration": "40 mins",
            "isFreePreview": true,
            "orderNumber": 4
          },
          {
            "id": "les_cyc_2_2",
            "title": "Color-Coded Alert Protocols (Yellow, Orange, Red Warnings)",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 5
          },
          {
            "id": "les_cyc_2_3",
            "title": "Disaster Mitigation SOPs with NDMA and State SDRF",
            "duration": "35 mins",
            "isFreePreview": false,
            "orderNumber": 6
          }
        ]
      }
    ]
  },
  {
    "id": "course_imd_competency_framework",
    "title": "IMD Capacity Building & Competency Framework on Blockchain LMS",
    "slug": "imd-competency-framework-blockchain",
    "category": "Capacity & Governance",
    "categoryId": "cat_capacity_governance",
    "description": "SARTHI (Capacity Connect) is designed to solve the structural training challenges within the India Meteorological Department: scattered paper records, lack of centralized LMS tracking, manual assessments, and absence of standardized competency mapping.\n\nThis foundational course introduces all IMD personnel, mentors, and departmental supervisors to the SARTHI portal architecture. Learn how role-based dashboards operate, how individualized skill-gap analysis guides career progression, and how completion credentials are cryptographically issued on the blockchain for permanent, tamper-proof verification.\n\nKey Learning Outcomes:\n\u2022 Overview of SARTHI: Centralized Learning Management Portal for IMD.\n\u2022 Role-based portals: Student/Officer, Faculty Trainer, and Ministerial Admin.\n\u2022 Understanding the WMO-compliant Competency Matrix for Meteorological Personnel (BIP-M & BIP-MT).\n\u2022 AI-driven Personalized Learning Paths based on skill-gap diagnostics.\n\u2022 Cryptographic blockchain verification of competency certificates on /verify/[id].",
    "shortDescription": "Foundational orientation on SARTHI's role-based competency matrix, skill-gap analysis, and cryptographically verifiable blockchain certifications for IMD personnel.",
    "level": "All Cadres",
    "thumbnail": "/courses/imd-competency-blockchain.png",
    "thumbnailIcon": "badge-check",
    "thumbnailColor": "#7E22CE",
    "price": 0,
    "originalPrice": 0,
    "pricing_type": "FREE",
    "currency": "INR",
    "badge": "CORE MANDATE \u2022 SIH 2026",
    "isFeatured": true,
    "isActive": true,
    "rating": 4.9,
    "ratingCount": 520,
    "reviewCount": 520,
    "studentsEnrolled": 2100,
    "totalDuration": 1800,
    "metaTitle": "IMD Competency Framework on Blockchain LMS | SARTHI",
    "metaDescription": "Core training module on SARTHI role-based LMS, competency mapping, and blockchain-verified certification.",
    "instructorId": "user_mohit_mentor",
    "instructor": {
      "id": "user_mohit_mentor",
      "name": "Mohit Raj",
      "image": "/images/instructors/mohit-raj-real.jpg",
      "bio": "Project Lead & Full Stack Architect of SARTHI, engineering resilient LMS infrastructure, competency tracking, and blockchain credentialing.",
      "headline": "Project Lead & Lead System Architect \u2022 Team Catalytic Coders",
      "company": "ARKA JAIN University & MoES Project SARTHI"
    },
    "curriculum": [
      {
        "id": "mod_comp_1",
        "title": "Module 1: SARTHI LMS Architecture & Navigation",
        "description": "Exploring officer dashboards, course enrollment, and progress monitoring.",
        "lessons": [
          {
            "id": "les_comp_1_1",
            "title": "Welcome to SARTHI: Centralized Capacity Building Vision",
            "duration": "15 mins",
            "isFreePreview": true,
            "orderNumber": 1
          },
          {
            "id": "les_comp_1_2",
            "title": "Role-Based Navigation: Trainee, Faculty, and Admin Portals",
            "duration": "20 mins",
            "isFreePreview": true,
            "orderNumber": 2
          },
          {
            "id": "les_comp_1_3",
            "title": "Competency Mapping & AI Skill-Gap Recommendations",
            "duration": "25 mins",
            "isFreePreview": false,
            "orderNumber": 3
          }
        ]
      },
      {
        "id": "mod_comp_2",
        "title": "Module 2: Verification & Career Accreditation",
        "description": "Blockchain certification, verifiable hashes, and annual competency reporting.",
        "lessons": [
          {
            "id": "les_comp_2_1",
            "title": "Completing Quizzes & Earning Official Certifications",
            "duration": "20 mins",
            "isFreePreview": false,
            "orderNumber": 4
          },
          {
            "id": "les_comp_2_2",
            "title": "How Cryptographic Certificate Verification Works on /verify",
            "duration": "25 mins",
            "isFreePreview": true,
            "orderNumber": 5
          }
        ]
      }
    ]
  }
];

// Stub exports — seeding via UI is not used in this IMD deployment.
// These are retained for build compatibility with seedCourses.ts.
export const INITIAL_CATEGORIES: {
  id: string; name: string; slug: string;
  color_bg: string; color_text: string; icon: string;
}[] = [];

export const INITIAL_INSTRUCTORS: {
  id: string; name: string; bio: string;
  company: string; image: string;
}[] = [];

