import Link from "next/link";
import Navbar from "@/components/interactive/Navbar";
import { AccordionItem } from "@/components/interactive/Accordion";
import { Carousel } from "@/components/interactive/Carousel";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  FloatMotion,
} from "@/components/motion/MotionWrapper";

export const metadata = {
  title: "SARTHI – Digital Capacity Building & Learning Management Portal | IMD, Ministry of Earth Sciences",
  description: "SARTHI – Digital Capacity Building & Learning Management Portal of India Meteorological Department (IMD), Ministry of Earth Sciences.",
};

export default function Page() {
  const testimonialSlides = [
    <div key="1" className="testimonial-card">
      <p className="testimonial-content">
        “SARTHI streamlined our training on numerical weather prediction models. The structured MCQ assessments verified our domain understanding effectively.”
      </p>
      <div className="testimonial-author-wrap">
        <div className="testimonial-image-wrap">
          <img
            src="/images/student-img-1.jpg"
            loading="lazy"
            alt="Portrait of a meteorologist"
            className="testimonial-image"
          />
        </div>
        <div className="testimonial-title-wrap">
          <h3 className="testimonial-title">Dr. Neha Gupta</h3>
          <p className="mb-0">Scientist 'SD', NWP Division</p>
        </div>
      </div>
    </div>,
    <div key="2" className="testimonial-card">
      <p className="testimonial-content">
        “Accessing lectures from senior IMD meteorologists 24/7 on SARTHI significantly boosted our operational forecasting readiness.”
      </p>
      <div className="testimonial-author-wrap">
        <div className="testimonial-image-wrap">
          <img
            src="/images/student-img-2.jpg"
            loading="lazy"
            alt="Portrait of a young meteorologist"
            className="testimonial-image"
          />
        </div>
        <div className="testimonial-title-wrap">
          <h3 className="testimonial-title">S. V. Raman</h3>
          <p className="mb-0">Meteorologist-II, Regional Meteorological Centre</p>
        </div>
      </div>
    </div>,
    <div key="3" className="testimonial-card">
      <p className="testimonial-content">
        “The centralized trainer library and instant certification tracking make capacity building transparent and accessible.”
      </p>
      <div className="testimonial-author-wrap">
        <div className="testimonial-image-wrap">
          <img
            src="/images/student-img-3.jpg"
            loading="lazy"
            alt="Testimonial Image"
            className="testimonial-image"
          />
        </div>
        <div className="testimonial-title-wrap">
          <h3 className="testimonial-title">Priyanka Sharma</h3>
          <p className="mb-0">Weather Forecasting Fundamentals</p>
        </div>
      </div>
    </div>,
  ];

  const suggestionTopics = [
    "Radar Weather",
    "Satellite Data",
    "NWP Forecasting",
    "Climate Modeling",
    "Monsoon Guidance",
  ];

  return (
    <>
      {/* Header & Hero Section */}
      <div className="header-area">
        <div className="regular-bg-wrap">
          <div className="regular-bg-pattern-wrap">
            <img
              src="/images/regular-banner-bg-pattern.png"
              loading="eager"
              alt="Regular BG Pattern"
              className="header-bg-pattern"
            />
          </div>
        </div>

        <Navbar activePage="home" />

        <div className="home-header-area">
          <section className="home-header-section">
            <div className="w-layout-blockcontainer container-large w-container">
              <div className="home-header-wrap">
                <div className="home-header-title-wrap">
                  <FadeIn direction="up" delay={0.1} duration={0.7}>
                    <h1 className="banner-title">
                      SARTHI — Building Capacity, Empowering IMD&apos;s Workforce
                    </h1>
                  </FadeIn>
                  <FadeIn direction="up" delay={0.25} duration={0.7}>
                    <div className="home-header-button-wrap">
                      <Link
                        href="/courses"
                        className="secondary-button w-inline-block"
                      >
                        <div className="button-text">Explore Courses</div>
                        <div className="button-bg"></div>
                      </Link>
                      <Link
                        href="/membership"
                        className="primary-button w-variant-257c52e7-edfb-b79b-270d-1f188e0cd141 w-inline-block"
                      >
                        <div className="button-text">Sign Up Free</div>
                        <div className="button-bg"></div>
                      </Link>
                    </div>
                  </FadeIn>
                </div>

                <FadeIn direction="up" delay={0.4} duration={0.7}>
                  <div className="header-student-area">
                    <div className="header-student-wrap">
                      <div className="student-image-wrap">
                        <img
                          src="/images/student-img-1.jpg"
                          loading="eager"
                          alt="Portrait of a trainee"
                          className="student-image"
                        />
                      </div>
                      <div className="student-image-wrap ml-12">
                        <img
                          src="/images/student-img-2.jpg"
                          loading="eager"
                          alt="Portrait of a young man"
                          className="student-image"
                        />
                      </div>
                      <div className="student-image-wrap ml-12">
                        <img
                          src="/images/student-img-3.jpg"
                          loading="eager"
                          alt="Portrait of a woman"
                          className="student-image"
                        />
                      </div>
                    </div>
                    <div className="header-student-title-wrap">
                      <div className="header-count-area">
                        <div className="header-count-wrap">
                          <h2 className="header-student-count">460+</h2>
                        </div>
                      </div>
                      <p className="header-student-text">Trainees Onboarded</p>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>

          <div className="home-header-bg-area">
            <div className="home-header-image-area">
              <FloatMotion duration={5}>
                <div className="home-header-image-whole-wrap">
                  <div className="home-header-image-wrap">
                    <img
                      src="/images/home-header-robo-imge.png"
                      loading="eager"
                      alt="Green robot character holding a stack of books."
                      className="home-header-image"
                    />
                    <div className="robo-eye-animation">
                      <div className="robo-eye"></div>
                    </div>
                    <div className="robo-eye-animation right">
                      <div className="robo-eye"></div>
                    </div>
                  </div>
                </div>
              </FloatMotion>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="regular-section">
        <div className="w-layout-blockcontainer container w-container">
          <FadeIn direction="up">
            <div className="section-title-area">
              <div className="regular-subtitle">
                <div className="regular-subtitle-icon"></div>
                <div className="regular-subtitle-text">Our Story</div>
              </div>
              <div className="section-title-wrap">
                <h2 className="section-title">
                  Strengthening IMD&apos;s Capacity Through Digital Learning
                </h2>
              </div>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.2} className="about-area" style={{ display: "flex", alignItems: "stretch", gap: "24px" }}>
            <div className="about-whole-wrap" style={{ flex: "1 1 64%", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="about-wrap">
                <StaggerItem>
                  <HoverCard className="about-card">
                    <div className="about-title-wrap">
                      <h3 className="regular-card-title">Mission</h3>
                      <p className="mb-0">
                        To provide IMD personnel a centralized platform for
                        structured training, competency development, and
                        continuous learning.
                      </p>
                    </div>
                    <div className="about-image-area">
                      <div className="about-image-whole-wrap">
                        <div className="about-image-wrap">
                          <img
                            src="/images/about-vision-img.jpg"
                            loading="eager"
                            alt="Workspace scene"
                            className="about-image"
                          />
                        </div>
                      </div>
                      <div className="about-marquee large">
                        <div className="about-marquee-wrap">
                          <div className="about-marquee-text-wrap"><div>SMART LEARNING</div></div>
                          <div className="about-marquee-text-wrap"><div>DIGITAL MINDS</div></div>
                          <div className="about-marquee-text-wrap"><div>TECH EDUCATION</div></div>
                          <div className="about-marquee-text-wrap"><div>SMART LEARNING</div></div>
                          <div className="about-marquee-text-wrap"><div>DIGITAL MINDS</div></div>
                          <div className="about-marquee-text-wrap"><div>TECH EDUCATION</div></div>
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem>
                  <HoverCard className="about-card">
                    <div className="about-title-wrap">
                      <h3 className="regular-card-title">Teamwork</h3>
                      <p className="mb-0">
                        Trainers and trainees collaborate to build subject-wise
                        expertise across meteorological domains.
                      </p>
                    </div>
                    <div className="about-image-area">
                      <div className="about-image-wrap">
                        <img
                          src="/images/about-img-01.png"
                          loading="eager"
                          alt="Teamwork network diagram"
                          className="about-image"
                        />
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              </div>

              <StaggerItem>
                <HoverCard className="about-card large">
                  <div className="about-title-wrap small">
                    <h3 className="regular-card-title">
                      Smarter Training, Simplified for Every Trainee
                    </h3>
                    <p className="mb-0">
                      A secure portal for course enrollment, MCQ assessments,
                      and certification tracking.
                    </p>
                    <div className="about-button-wrap">
                      <Link
                        href="/courses"
                        className="primary-button primary-small-button w-inline-block"
                      >
                        <div className="button-text primary-small-button">
                          Explore Courses
                        </div>
                        <div className="button-bg primary-small-button"></div>
                      </Link>
                      <Link
                        href="/membership"
                        className="primary-button transparent-small-button w-inline-block"
                        style={{ color: "rgb(12,33,29)" }}
                      >
                        <div className="button-text">Course Plans</div>
                        <div className="button-bg green-bg"></div>
                      </Link>
                    </div>
                  </div>
                  <div className="about-image-area small">
                    <div className="about-image-wrap">
                      <img
                        src="/images/about-img-03.png"
                        loading="eager"
                        alt="White futuristic robot cards"
                        className="about-image"
                      />
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            </div>

            {/* Right Column: Learning Path Card with Search Suggestions + 3D Robot */}
            <StaggerItem style={{ flex: "1 1 34%", display: "flex" }}>
              <HoverCard
                className="about-card medium"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundImage: "linear-gradient(#f7f5ee 38%, rgba(247, 245, 238, 0)), url('/images/about-img-02.jpg')",
                  backgroundPosition: "0 0, 50%",
                  backgroundRepeat: "repeat, no-repeat",
                  backgroundSize: "auto, cover",
                  padding: "36px 28px 0 28px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
                }}
              >
                <div>
                  <div className="about-title-wrap" style={{ marginBottom: "24px" }}>
                    <h3 className="regular-card-title">Learning Path</h3>
                    <p className="mb-0">
                      A clear learning path guides trainees step by step through
                      domain-specific training modules.
                    </p>
                  </div>

                  <div className="about-search-area">
                    <div className="about-search-wrap">
                      <div>Search courses, topics, or trainers...</div>
                      <div className="about-search-icon-wrap">
                        <img
                          src="/images/about-search-icon.svg"
                          loading="lazy"
                          alt="Search symbol"
                          className="about-search-icon"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Suggestions Chips below Search Bar */}
                  <div style={{ marginTop: "18px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#1e5246", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                      Suggested Topics:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {suggestionTopics.map((topic, index) => (
                        <Link key={index} href="/courses" className="suggestion-chip">
                          {topic}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3D Green Robot Character standing on the green land background */}
                <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-end", marginTop: "16px", paddingBottom: "10px", flex: 1 }}>
                  <FloatMotion duration={5}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src="/images/cta-robo-img.png"
                        loading="eager"
                        alt="3D Green Robot Character walking on green land"
                        style={{
                          maxHeight: "220px",
                          width: "auto",
                          objectFit: "contain",
                          filter: "drop-shadow(0 15px 25px rgba(12, 33, 29, 0.28))"
                        }}
                      />
                      <div className="cta-eye-animation">
                        <div className="cta-eye"></div>
                      </div>
                      <div className="cta-eye-animation right">
                        <div className="cta-eye"></div>
                      </div>
                    </div>
                  </FloatMotion>
                </div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Training Courses Section */}
      <section className="regular-bg-section">
        <div className="w-layout-blockcontainer container w-container">
          <FadeIn direction="up">
            <div className="related-post-top-wrap">
              <div className="section-title-area left">
                <div className="regular-subtitle">
                  <div className="regular-subtitle-icon"></div>
                  <div className="regular-subtitle-text">FEATURED CLASS</div>
                </div>
                <div className="section-title-wrap medium">
                  <h2 className="section-title">Featured Training Courses</h2>
                </div>
              </div>
              <div className="section-button-wrap">
                <Link
                  href="/courses"
                  className="primary-button w-inline-block"
                >
                  <div className="button-text">View All Courses</div>
                  <div className="button-bg w-variant-6cce7198-5594-dc03-f17d-9824fa6e96bc"></div>
                </Link>
              </div>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.15} className="more-course-card-wrap">
            <div className="w-dyn-list">
              <div role="list" className="w-dyn-items w-row">
                <StaggerItem className="more-courses-collection-item w-dyn-item w-col w-col-4">
                  <HoverCard className="course-card">
                    <div className="course-image-area">
                      <Link
                        href="/courses/deep-learning"
                        className="course-image-wrap w-inline-block"
                      >
                        <img
                          src="/images/course-thumbnail-img-05.jpg"
                          loading="lazy"
                          alt="Course Thumbnail"
                          className="course-initial-image"
                        />
                      </Link>
                      <div className="course-offer">
                        <div>Level:</div>
                        <div>Basic</div>
                      </div>
                    </div>
                    <div className="course-content-area">
                      <div className="course-title-wrap">
                        <div className="regular-grow-line-wrap">
                          <Link
                            href="/courses/deep-learning"
                            className="course-title"
                          >
                            Weather Forecasting Fundamentals
                          </Link>
                        </div>
                        <Link href="/team/prof-david-lee" className="author-link">
                          Dr. R. K. Sharma (Scientist-F, IMD)
                        </Link>
                      </div>
                      <div className="course-details-area">
                        <div className="course-details-card">
                          <div className="course-icon-wrap bottom">
                            <img
                              src="/images/course-icon-01.svg"
                              loading="lazy"
                              alt="Notes"
                              className="course-icon"
                            />
                          </div>
                          <div className="course-details-text-wrap">
                            <p className="course-details-text">12 Lessons</p>
                          </div>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">10h 55m</p>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">4.9 ★</p>
                        </div>
                      </div>
                      <div className="course-read-button">
                        <Link
                          href="/courses/deep-learning"
                          className="white-button w-variant-ec28ab31-14d2-af8f-d070-133dfba088be w-inline-block"
                        >
                          <div className="button-text">Enroll Now</div>
                          <div className="button-bg green-bg"></div>
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem className="more-courses-collection-item w-dyn-item w-col w-col-4">
                  <HoverCard className="course-card">
                    <div className="course-image-area">
                      <Link
                        href="/courses/deep-learning"
                        className="course-image-wrap w-inline-block"
                      >
                        <img
                          src="/images/course-thumbnail-img-06.jpg"
                          loading="lazy"
                          alt="Course Thumbnail"
                          className="course-initial-image"
                        />
                      </Link>
                      <div className="course-offer">
                        <div>Level:</div>
                        <div>Inter.</div>
                      </div>
                    </div>
                    <div className="course-content-area">
                      <div className="course-title-wrap">
                        <div className="regular-grow-line-wrap">
                          <Link
                            href="/courses/deep-learning"
                            className="course-title"
                          >
                            Climate Data Analysis & Modeling
                          </Link>
                        </div>
                        <Link href="/team/prof-david-lee" className="author-link">
                          Dr. S. K. Roy (Scientist-E, MoES)
                        </Link>
                      </div>
                      <div className="course-details-area">
                        <div className="course-details-card">
                          <p className="course-details-text">08 Lessons</p>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">07h 30m</p>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">4.5 ★</p>
                        </div>
                      </div>
                      <div className="course-read-button">
                        <Link
                          href="/courses/deep-learning"
                          className="white-button w-variant-ec28ab31-14d2-af8f-d070-133dfba088be w-inline-block"
                        >
                          <div className="button-text">Enroll Now</div>
                          <div className="button-bg green-bg"></div>
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>

                <StaggerItem className="more-courses-collection-item w-dyn-item w-col w-col-4">
                  <HoverCard className="course-card">
                    <div className="course-image-area">
                      <Link
                        href="/courses/deep-learning"
                        className="course-image-wrap w-inline-block"
                      >
                        <img
                          src="/images/course-thumbnail-img-07.jpg"
                          loading="lazy"
                          alt="Course Thumbnail"
                          className="course-initial-image"
                        />
                      </Link>
                      <div className="course-offer">
                        <div>Level:</div>
                        <div>Adv.</div>
                      </div>
                    </div>
                    <div className="course-content-area">
                      <div className="course-title-wrap">
                        <div className="regular-grow-line-wrap">
                          <Link
                            href="/courses/deep-learning"
                            className="course-title"
                          >
                            Meteorological Instrumentation & Radar
                          </Link>
                        </div>
                        <Link href="/team/prof-david-lee" className="author-link">
                          Dr. Ananya Verma (Director, NWP)
                        </Link>
                      </div>
                      <div className="course-details-area">
                        <div className="course-details-card">
                          <p className="course-details-text">18 Lessons</p>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">15h 20m</p>
                        </div>
                        <div className="course-line-break"></div>
                        <div className="course-details-card">
                          <p className="course-details-text">4.8 ★</p>
                        </div>
                      </div>
                      <div className="course-read-button">
                        <Link
                          href="/courses/deep-learning"
                          className="white-button w-variant-ec28ab31-14d2-af8f-d070-133dfba088be w-inline-block"
                        >
                          <div className="button-text">Enroll Now</div>
                          <div className="button-bg green-bg"></div>
                        </Link>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              </div>
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Why SARTHI Section */}
      <section className="regular-section">
        <div className="why-animation-wrap">
          <div className="w-layout-blockcontainer container w-container">
            <FadeIn direction="up">
              <div className="section-title-area">
                <div className="regular-subtitle">
                  <div className="regular-subtitle-icon"></div>
                  <div className="regular-subtitle-text">Why Us</div>
                </div>
                <div className="section-title-wrap medium">
                  <h2 className="section-title">Why SARTHI</h2>
                </div>
              </div>
            </FadeIn>

            <div className="why-area">
              <div className="why-card-wrap">
                <FadeIn direction="right">
                  <HoverCard className="why-card">
                    <div className="why-icon-wrap">
                      <img
                        src="/images/why-icon-01.svg"
                        loading="lazy"
                        alt="Certificate symbol"
                        className="why-icon"
                      />
                    </div>
                    <div className="why-title-wrap">
                      <h3 className="regular-card-title">Verified Certification</h3>
                      <p className="mb-0">
                        Earn recognized certificates on successful course and assessment completion.
                      </p>
                    </div>
                  </HoverCard>
                </FadeIn>
                <div className="why-line-break first"></div>
                <FadeIn direction="right" delay={0.2}>
                  <HoverCard className="why-card">
                    <div className="why-icon-wrap">
                      <img
                        src="/images/why-icon-02.svg"
                        loading="lazy"
                        alt="Handshake symbol"
                        className="why-icon"
                      />
                    </div>
                    <div className="why-title-wrap">
                      <h3 className="regular-card-title">Competency Mapping</h3>
                      <p className="mb-0">
                        Identify the right trainers and learning paths mapped to your subject expertise.
                      </p>
                    </div>
                  </HoverCard>
                </FadeIn>
              </div>

              {/* Central 3D Green Robot Character Holding Books */}
              <FloatMotion duration={6}>
                <div className="why-image-wrap" style={{ minWidth: "320px", maxWidth: "420px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div className="why-background-video w-background-video" style={{ width: "100%", height: "auto", minHeight: "380px", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <video
                      autoPlay={true}
                      loop={true}
                      muted={true}
                      playsInline={true}
                      poster="/images/why-video-poster-00001.jpg"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }}
                    >
                      <source src="/images/why-video-transcode.mp4" type="video/mp4" />
                      <source src="/images/why-video-transcode.webm" type="video/webm" />
                    </video>
                  </div>
                </div>
              </FloatMotion>

              <div className="why-card-wrap">
                <FadeIn direction="left">
                  <HoverCard className="why-card right">
                    <div className="why-icon-wrap">
                      <img
                        src="/images/why-icon-03.svg"
                        loading="lazy"
                        alt="Brain symbol"
                        className="why-icon"
                      />
                    </div>
                    <div className="why-title-wrap">
                      <h3 className="regular-card-title">Expert Trainers</h3>
                      <p className="mb-0">
                        Learn from IMD&apos;s experienced trainers through recorded lectures and live sessions.
                      </p>
                    </div>
                  </HoverCard>
                </FadeIn>
                <div className="why-line-break second"></div>
                <FadeIn direction="left" delay={0.2}>
                  <HoverCard className="why-card right">
                    <div className="why-icon-wrap">
                      <img
                        src="/images/why-icon-04.svg"
                        loading="lazy"
                        alt="Chalkboard symbol"
                        className="why-icon"
                      />
                    </div>
                    <div className="why-title-wrap">
                      <h3 className="regular-card-title">Structured Assessments</h3>
                      <p className="mb-0">
                        Subject-wise MCQ assessments track and validate your domain progress.
                      </p>
                    </div>
                  </HoverCard>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="regular-section top-0">
        <div className="regular-testimonial">
          <div className="w-layout-blockcontainer container w-container">
            <FadeIn direction="up">
              <div className="section-title-area">
                <div className="regular-subtitle">
                  <div className="regular-subtitle-icon"></div>
                  <div className="regular-subtitle-text">Success Stories</div>
                </div>
                <div className="section-title-wrap">
                  <h2 className="section-title">What Our Trainees Say</h2>
                </div>
              </div>
            </FadeIn>

            <div className="testimonial-area">
              <FadeIn direction="right" className="testimonial-cta-card">
                <div className="testimonial-cta-bg-wrap">
                  <div className="testimonial-bg-pattern-wrap">
                    <img
                      src="/images/testimonial-bg-pattern.png"
                      loading="lazy"
                      alt="Testimonial BG Pattern"
                      className="testimonial-bg-pattern"
                    />
                  </div>
                  <div className="testimonial-cta-bg"></div>
                </div>
                <div className="testimonial-cta-title-wrap">
                  <h3 className="testimonial-cta-title">
                    High Trainee Satisfaction Across IMD Divisions
                  </h3>
                </div>
                <div className="testimonial-cta-image-wrap">
                  <img
                    src="/images/testimonial-large-img.jpg"
                    loading="lazy"
                    alt="Trainees celebrating"
                    className="testimonial-cta-image"
                  />
                </div>
              </FadeIn>

              <FadeIn direction="left" className="testimonial-wrap">
                <Carousel slides={testimonialSlides} />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="regular-section">
        <div className="regular-faq">
          <div className="w-layout-blockcontainer container w-container">
            <div className="faq-area">
              <FadeIn direction="up">
                <div className="faq-title-area">
                  <div className="section-title-area left">
                    <div className="regular-subtitle">
                      <div className="regular-subtitle-icon"></div>
                      <div className="regular-subtitle-text">faqs</div>
                    </div>
                    <div className="section-title-wrap medium">
                      <h2 className="section-title">Frequently Asked Questions</h2>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <StaggerContainer staggerDelay={0.15} className="faq-wrap">
                <StaggerItem>
                  <AccordionItem
                    defaultOpen={true}
                    question="Do I need prior experience to join the course?"
                    answer="No experience is needed. The course starts with the basics and guides you step by step through practical meteorological exercises and projects."
                  />
                </StaggerItem>
                <StaggerItem>
                  <AccordionItem
                    question="How long does it take to complete a course?"
                    answer="Most scientific trainees finish in 8–12 weeks depending on spend time. The flexible schedule allows you to learn at your own pace."
                  />
                </StaggerItem>
                <StaggerItem>
                  <AccordionItem
                    question="Will I get a verified certificate after completing the course?"
                    answer="Yes, an official IMD / MoES capacity building certificate is issued upon completing all lessons and MCQ assessments."
                  />
                </StaggerItem>
                <StaggerItem>
                  <AccordionItem
                    question="Can I access the course materials anytime?"
                    answer="Yes, all video lectures, course notes, and exercise resources are available online 24/7."
                  />
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg-wrap">
          <div className="cta-bg-pattern-wrap">
            <img
              src="/images/regular-banner-bg-pattern.png"
              loading="lazy"
              alt="Regular BG Pattern"
              className="cta-bg-pattern"
            />
          </div>
        </div>
        <div className="cta-whole-area">
          <div className="cta-area">
            <div className="w-layout-blockcontainer container w-container">
              <div className="cta-wrap">
                <div className="cta-title-wrap">
                  <h2 className="section-title text-white">
                    Build Skills. Build Capacity. Build SARTHI.
                  </h2>
                </div>
                <div className="cta-content-area">
                  <p className="cta-content">
                    Join SARTHI to strengthen your meteorological expertise and
                    empower IMD&apos;s scientific mission.
                  </p>
                  <div className="cta-button-wrap">
                    <Link href="/contact" className="secondary-button w-inline-block">
                      <div className="button-text">Sign Up Free</div>
                      <div className="button-bg"></div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="cta-image-area">
            <FloatMotion duration={4}>
              <div className="cta-image-wrap">
                <img
                  src="/images/cta-robo-img.png"
                  loading="lazy"
                  alt="Green robot character holding books"
                  className="cta-image"
                />
                <div className="cta-eye-animation">
                  <div className="cta-eye"></div>
                </div>
                <div className="cta-eye-animation right">
                  <div className="cta-eye"></div>
                </div>
              </div>
            </FloatMotion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="w-layout-blockcontainer container w-container">
          <div className="footer-top-wrap">
            <div className="footer-widget-area">
              <div className="footer-widget-wrap small">
                <div className="footer-widget-link-area contact">
                  <p className="footer-widget-title">Contact</p>
                  <div className="footer-widget-link-wrap">
                    <a
                      href="mailto:sarthi.support@imd.gov.in"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">
                        sarthi.support@imd.gov.in
                      </div>
                    </a>
                    <a
                      href="tel:+911124631913"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">+91 11 2463 1913</div>
                    </a>
                  </div>
                </div>
                <div className="footer-widget-link-area medium">
                  <p className="footer-widget-title">Address</p>
                  <div className="footer-widget-link-wrap">
                    <p className="footer-widget-text">
                      India Meteorological Department, Ministry of Earth
                      Sciences, Mausam Bhawan, Lodi Road, New Delhi 110003
                    </p>
                  </div>
                </div>
              </div>
              <div className="footer-widget-wrap">
                <div className="footer-widget-link-area">
                  <p className="footer-widget-title">Main Pages</p>
                  <div className="footer-widget-link-wrap">
                    <Link
                      href="/home"
                      className="footer-widget-link w-inline-block w--current"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Home</div>
                    </Link>
                    <Link
                      href="/about"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">About</div>
                    </Link>
                    <Link
                      href="/events"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Events</div>
                    </Link>
                    <Link
                      href="/membership"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">User Roles</div>
                    </Link>
                    <Link
                      href="/contact"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Contact</div>
                    </Link>
                  </div>
                </div>
                <div className="footer-widget-link-area">
                  <p className="footer-widget-title">CMS</p>
                  <div className="footer-widget-link-wrap">
                    <Link
                      href="/courses"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Courses</div>
                    </Link>
                    <Link
                      href="/blog"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Blog</div>
                    </Link>
                    <Link
                      href="/team"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Team</div>
                    </Link>
                  </div>
                </div>
                <div className="footer-widget-link-area">
                  <p className="footer-widget-title">Utility Pages</p>
                  <div className="footer-widget-link-wrap">
                    <Link
                      href="/template-info/style-guide"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Style Guide</div>
                    </Link>
                    <Link
                      href="/template-info/licenses"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Licenses</div>
                    </Link>
                    <Link
                      href="/template-info/changelog"
                      className="footer-widget-link w-inline-block"
                    >
                      <div className="footer-widget-icon"></div>
                      <div className="footer-widget-text">Changelog</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-title-area">
              <div className="footer-title-wrap">
                <Link href="/home" className="footer-title">
                  S
                </Link>
                <Link href="/home" className="footer-title">
                  A
                </Link>
                <Link href="/home" className="footer-title">
                  R
                </Link>
                <Link href="/home" className="footer-title">
                  T
                </Link>
                <Link href="/home" className="footer-title">
                  H
                </Link>
                <Link href="/home" className="footer-title">
                  I
                </Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom-wrap">
            <div className="footer-copyright-text-wrap">
              <p className="footer-copyright-text">
                Copyright © SARTHI — India Meteorological Department, Ministry of Earth Sciences
              </p>
            </div>
            <div className="footer-social-wrap">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon-wrap w-inline-block"
              >
                <img
                  src="/images/footer-facebook.svg"
                  loading="lazy"
                  alt="Facebook symbol"
                  className="footer-social-icon"
                />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon-wrap w-inline-block"
              >
                <img
                  src="/images/footer-instagram.svg"
                  loading="lazy"
                  alt="Instagram symbol"
                  className="footer-social-icon"
                />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-icon-wrap w-inline-block"
              >
                <img
                  src="/images/footer-linkdin.svg"
                  loading="lazy"
                  alt="linkedin symbol"
                  className="footer-social-icon"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
