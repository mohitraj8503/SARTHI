import { prisma } from '../lib/prisma';
import { clearResiliencyCache } from '../lib/resilient-db';

async function seedCompleteSoumyaCourses() {
  console.log('🚀 Starting complete update for Soumya Dasgupta Executive Masterclasses...');

  // 1. Ensure Instructor User (Soumya Dasgupta) exists & updated
  let soumyaUser = await prisma.user.findFirst({
    where: { email: 'soumyacdpl@gmail.com' }
  });

  const soumyaBio = `MBA (IIM Calcutta) · FRM® · TOGAF 9 · ITIL V3
CBO & Co-Founder, Connectingdot Consultancy Pvt Ltd
• 20+ Years Global Experience across FinTech, Financial Risk, AI in Banking, and Startup Incubation.
• 500+ Professionals & Students Trained | Visiting/Guest Faculty across 6 IIMs (IIM Calcutta, Udaipur, Sirmaur, Lucknow, Vizag, Shillong), ICSI, and AIMK.
• Creator of LADA AI/ML credit risk platform deployed live in banks and NBFCs across India & Bangladesh (Patent Pending No. 202331054743, Winner — Global Banking & Finance Excellence Award 2025).
• Banking Training Delivered: BIRD (NABARD), IndusInd Bank, Axis Bank (Risk Academy & Corporate Banking), Hero Fincorp, SEMS Welfare Foundation.
• Global Experience: Accenture Financial Risk Advisory (US, Saudi Arabia), Credit Suisse Singapore (Cognizant), TCS, IRIS Software.
• Contact: soumyacdpl@gmail.com | (+91) 98865 96800`;

  if (!soumyaUser) {
    soumyaUser = await prisma.user.create({
      data: {
        email: 'soumyacdpl@gmail.com',
        name: 'Soumya Dasgupta',
        role: 'INSTRUCTOR',
        image: '/teachers/soumya-dasgupta.png',
        bio: soumyaBio,
        company: 'Connectingdot Consultancy Pvt Ltd',
        headline: 'MBA (IIM Calcutta) · FRM® · TOGAF 9 · CBO & Co-Founder, CDPL'
      }
    });
    console.log(`👤 Created Instructor User Profile: Soumya Dasgupta (${soumyaUser.id})`);
  } else {
    soumyaUser = await prisma.user.update({
      where: { id: soumyaUser.id },
      data: {
        name: 'Soumya Dasgupta',
        role: 'INSTRUCTOR',
        image: '/teachers/soumya-dasgupta.png',
        bio: soumyaBio,
        company: 'Connectingdot Consultancy Pvt Ltd',
        headline: 'MBA (IIM Calcutta) · FRM® · TOGAF 9 · CBO & Co-Founder, CDPL'
      }
    });
    console.log(`👤 Updated Instructor User Profile: Soumya Dasgupta (${soumyaUser.id})`);
  }

  const instructorId = soumyaUser.id;

  // 2. Define the 4 Masterclasses with complete metadata, media & 20-session syllabus
  const courses = [
    {
      id: 'course_fintech_innovation_strategy_regulation',
      title: 'Innovation, Strategy and Regulation',
      slug: 'fintech-innovation-strategy-and-regulation',
      category: 'Finance',
      level: 'Executive',
      price: 4999,
      originalPrice: 9999,
      duration: 1800, // 30 hours (1800 mins)
      rating: 4.8,
      ratingCount: 142,
      badge: 'EXECUTIVE',
      introVideoUrl: 'https://drive.usercontent.google.com/download?export=download&id=1m-6wxDuQmWF45tKGZVnSzoKD8jxJj5Wu&confirm=t',
      syllabusUrl: '/flyers/Flyer_Fintech_Bcshool_30hr_Course.pdf',
      shortDescription: 'Learn how organizations turn emerging technology into sustainable business advantage while navigating regulation, governance, and operational realities.',
      description: `Overview:
Learn how organizations can turn emerging technology into sustainable business advantage while navigating regulation, governance, and operational realities. This course connects innovation strategy with responsible technology adoption and practical execution.

What You Will Learn:
• Identify and evaluate technology-driven opportunities with strategic business value.
• Build innovation roadmaps aligned with organizational priorities.
• Assess emerging technologies from both business and implementation perspectives.
• Understand the role of regulation, governance, privacy, and responsible technology adoption.
• Evaluate technology risks before moving from experimentation to deployment.
• Build practical strategies for scaling innovation across teams and organizations.
• Balance speed, experimentation, risk management, and regulatory responsibility.

Practical Focus:
Learners work with realistic strategic decisions around innovation, technology adoption, governance, and regulatory constraints.

Who This Is For:
Designed for business leaders, strategy professionals, consultants, entrepreneurs, technology professionals, managers, and decision-makers working with emerging technology.

Delivery Model:
• B-School Full Credit: 30 hours · 20 sessions · 90 minutes per session
• B-School Half Credit: 15 hours · 10 sessions · 90 minutes per session
• Corporate Intensive: 3–5 day format with flexible session structure
• Custom Program: Industry-specific case studies and tailored learning outcomes`,
      modules: [
        {
          title: "Module A: Global & Indian FinTech Landscape",
          description: "Understanding financial technology evolution, Digital Public Infrastructure, and regulatory mandates.",
          sessions: [
            "Session 1: Evolution of Financial Technology & Global Ecosystems",
            "Session 2: India's Digital Public Infrastructure (DPI) & Account Aggregator Architecture",
            "Session 3: Digital Banking, Neo-Banking Models & Core Banking Modernization"
          ]
        },
        {
          title: "Module B: Payments, Lending & Credit-Tech",
          description: "UPI 2.0, Credit on UPI, BNPL models, alternative data scoring, and underwriting workflows.",
          sessions: [
            "Session 4: UPI, Credit on UPI, and Next-Gen Payment Gateways",
            "Session 5: Digital Lending, BNPL, and Alternative Credit Underwriting",
            "Session 6: Credit-Tech: Scorecards, Cash-Flow Based Lending & GSTN Integration"
          ]
        },
        {
          title: "Module C: LADA Credit Risk Modelling (Hands-On)",
          description: "Live credit risk modelling using LADA platform deployed in banks and NBFCs across India.",
          sessions: [
            "Session 7: LADA Architecture: Non-Parametric Scoring & Data Ingestion",
            "Session 8: Hands-On Credit Assessment & Scorecard Validation on LADA",
            "Session 9: Early Warning Systems (EWS) & Default Risk Prediction"
          ]
        },
        {
          title: "Module D: Blockchain, Web3 & Asset Tokenization",
          description: "Distributed ledgers, smart contracts, CBDC (e-Rupee), and tokenized real-world assets.",
          sessions: [
            "Session 10: Blockchain Foundations & Enterprise Smart Contracts",
            "Session 11: RBI Central Bank Digital Currency (e-Rupee) Architecture",
            "Session 12: Real-World Asset Tokenization & Decentralized Finance (DeFi) Realities"
          ]
        },
        {
          title: "Module E: Algorithmic Trading & Market Structure",
          description: "HFT, algorithmic trading frameworks, SEBI regulatory guidelines, and automated strategies.",
          sessions: [
            "Session 13: Algorithmic Trading & High-Frequency Market Architecture",
            "Session 14: SEBI Algorithmic Trading Circular & Compliance Workflows",
            "Session 15: Quantitative Backtesting & Strategy Execution"
          ]
        },
        {
          title: "Module F: FinTech Regulation, Governance & RegTech",
          description: "RBI FREE-AI, DPDP Act 2023, AML graph networks, and regulatory sandbox compliance.",
          sessions: [
            "Session 16: RBI FREE-AI Framework & Responsible AI Governance",
            "Session 17: DPDP Act 2023 Compliance & Data Privacy in Financial Services",
            "Session 18: RegTech, AML Graph Networks & MuleHunter.AI Fraud Defence"
          ]
        },
        {
          title: "Module G: Capstone Synthesis & Strategy Roadmap",
          description: "Designing a comprehensive FinTech innovation roadmap and executive pitch.",
          sessions: [
            "Session 19: Building an Institutional FinTech Innovation & Adoption Roadmap",
            "Session 20: Course Capstone Synthesis, Strategic Case Defense & Evaluation"
          ]
        }
      ]
    },

    {
      id: 'course_financial_risk_management_ecl',
      title: 'Financial Risk Management',
      slug: 'financial-risk-management-and-expected-credit-loss',
      category: 'Finance',
      level: 'Executive',
      price: 5999,
      originalPrice: 11999,
      duration: 1800,
      rating: 4.8,
      ratingCount: 118,
      badge: 'EXECUTIVE',
      introVideoUrl: 'https://drive.usercontent.google.com/download?export=download&id=10-TutjcVqNwKFCsPNBYl6Qx4CwKImOif&confirm=t',
      syllabusUrl: '/flyers/Flyer_FRM_ECL_Bcshool_30hr_Course.pdf',
      shortDescription: 'Build a structured understanding of how financial institutions identify, measure, monitor, and manage credit, market, liquidity, and operational risk.',
      description: `Overview:
Build a structured understanding of how financial institutions identify, measure, monitor, and manage risk. The course connects core risk frameworks with practical approaches to credit assessment, expected credit loss, market exposure, liquidity, and operational resilience.

What You Will Learn:
• Understand the core categories of financial risk and how institutions manage them.
• Analyse credit risk and the factors that influence lending decisions.
• Understand expected credit loss concepts and practical credit-risk modelling workflows.
• Explore market and liquidity risk measurement and monitoring.
• Design early warning indicators for deteriorating credit or financial conditions.
• Examine operational and process risks within financial institutions.
• Connect risk analysis with governance, reporting, controls, and business decisions.

Practical Focus:
The course emphasizes practical risk analysis, scenario-based decision-making, risk monitoring, and the translation of technical risk measures into actionable business decisions.

Who This Is For:
Suitable for finance professionals, banking professionals, risk managers, credit professionals, analysts, consultants, and learners building a career in financial risk and banking.

Delivery Model:
• B-School Full Credit: 30 hours · 20 sessions · 90 minutes per session
• B-School Half Credit: 15 hours · 10 sessions · 90 minutes per session
• Corporate Intensive: 3–5 day format with flexible session structure
• Custom Program: Industry-specific case studies and tailored learning outcomes`,
      modules: [
        {
          title: "Part A — Financial Risk Management (Sessions 1–12)",
          description: "Core financial risk taxonomy, regulatory architecture, quantitative foundations, market risk, and climate risk.",
          sessions: [
            "Session 1: Risk Landscape & Regulatory Architecture (Basel III, IndAS 109, FRTB)",
            "Session 2: Risk Statistics & Quantitative Foundations (Probability, Monte Carlo, Model Risk)",
            "Session 3: Fixed Income & Equity Risk (Duration, Convexity, Yield Curves, CAPM)",
            "Session 4: Derivatives, FX & Commodity Risk (Options, Swaps, Black-Scholes, CVA/DVA)",
            "Session 5: Credit Risk Scorecards & Alternative Data (PD/LGD/EAD, WoE/IV Methodology)",
            "Session 6: Portfolio Credit Risk & Economic Capital (CreditMetrics, Credit VaR, Stress Testing)",
            "Session 7: LADA Hands-On Session 1: Data Ingestion & Baseline Scorecard Building",
            "Session 8: LADA Hands-On Session 2: XGBoost, SHAP/LIME Explainability & EWS Run",
            "Session 9: Market Risk: VaR, Expected Shortfall, ALM & LCR/NSFR Liquidity Management",
            "Session 10: FX, Equity, Commodity Risk & FRTB Sensitivities-Based Method",
            "Session 11: Operational Risk & ERM (Basel IV SMA, RCSA, KRIs, Cyber Risk)",
            "Session 12: Climate Risk & ESG Integration (TCFD, NGFS Scenarios, Climate-Adjusted PD)"
          ]
        },
        {
          title: "Part B — Expected Credit Loss (Sessions 13–20)",
          description: "RBI April 2027 ECL mandate alignment, IndAS 109 / IFRS 9 staging, PD/LGD/EAD formulation, and live LADA ECL Modelling.",
          sessions: [
            "Session 13: ECL Framework & Regulation (Incurred Loss vs ECL, RBI 5-Year Glide Path, Staging)",
            "Session 14: ECL Components: PIT vs TTC PD, Vasicek Model, Collection Curve LGD, CCF Formula",
            "Session 15: PD Modelling: Logistic Regression, Survival Analysis (Cox PH, Kaplan-Meier), Macro Overlays",
            "Session 16: LGD, EAD & Complete ECL Integration (Workout LGD, Downturn LGD, Excel Exercise)",
            "Session 17: ECL Governance, Model Approval & RBI Compliance Disclosures",
            "Session 18: LADA ECL Live Hands-On Session: Staging Assignment & RBI Disclosure Export",
            "Session 19: ECL Role-Play: Proprietary 8-Dimension Implementation Assessment Framework",
            "Session 20: Course Integration: ECL, Basel CET1 Capital Interaction & Future of Risk"
          ]
        }
      ]
    },

    {
      id: 'course_ai_machine_learning_in_banking',
      title: 'AI & Machine Learning in Banking',
      slug: 'ai-and-machine-learning-in-banking',
      category: 'Artificial Intelligence',
      level: 'Executive',
      price: 4999,
      originalPrice: 9999,
      duration: 1800,
      rating: 4.8,
      ratingCount: 164,
      badge: 'EXECUTIVE',
      introVideoUrl: 'https://drive.usercontent.google.com/download?export=download&id=16UizbRJ-Cho7-c9QtUHmoAz_YpGraKVg&confirm=t',
      syllabusUrl: '/flyers/Flyer_AIML_Bcshool_30hr_Course.pdf',
      shortDescription: 'Explore how AI and machine learning are changing the way banks assess risk, serve customers, detect fraud, and improve operational decisions.',
      description: `Overview:
Explore how AI and machine learning are changing the way banks assess risk, serve customers, detect fraud, and improve operational decisions. The course connects modern AI concepts with practical banking use cases and real financial workflows.

What You Will Learn:
• Understand the role of AI and machine learning across modern banking operations.
• Identify practical use cases in credit assessment, underwriting, fraud detection, and customer analytics.
• Explore predictive models and decision-support workflows used in financial services.
• Understand how data quality, feature engineering, and model evaluation affect banking outcomes.
• Examine generative AI applications for analysts, relationship managers, operations, and leadership teams.
• Design practical AI use-case roadmaps for financial institutions.
• Understand responsible AI, governance, explainability, and regulatory considerations surrounding financial decisions.

Practical Focus:
Learners work through banking-focused scenarios and decision workflows rather than studying machine learning only from a theoretical perspective.

Who This Is For:
Suitable for banking professionals, finance professionals, analysts, risk teams, managers, consultants, technology professionals, and learners preparing for careers at the intersection of AI and financial services.

Delivery Model:
• B-School Full Credit: 30 hours · 20 sessions · 90 minutes per session
• B-School Half Credit: 15 hours · 10 sessions · 90 minutes per session
• Corporate Intensive: 3–5 day format with flexible session structure
• Custom Program: Industry-specific case studies and tailored learning outcomes`,
      modules: [
        {
          title: "Module 1: Global AI Strategy & Regulatory Foundations",
          description: "Global AI compute landscape, RBI FREE-AI Framework, and core ML/GenAI principles for bankers.",
          sessions: [
            "Session 1: Global AI Chessboard: Hardware-to-Application View & India Application Layer Thesis",
            "Session 2: India's AI Momentum, Regulation & the RBI FREE-AI Seven Sutras Framework",
            "Session 3: Core AI/ML Concepts for Bankers: Predictive vs Generative AI & Non-Parametric Scoring"
          ]
        },
        {
          title: "Module 2: GenAI & Office Transformation (Front, Middle & Back Office)",
          description: "Financial-grade prompt engineering, RM insights, credit memo GenAI, and automated compliance.",
          sessions: [
            "Session 4: Financial-Grade Prompt Engineering & Industry AI Toolkit (ChatFin, Kira)",
            "Session 5: Front Office Transformation: Analyst Automation & RM Personalisation",
            "Session 6: Middle Office Transformation: Credit, Risk, EWS & Personal AI CFO",
            "Session 7: Back Office Operations: IDP/OCR, STP & AML Graph Networks",
            "Session 8: Leadership & Governance: Board-Level AI Oversight & Third-Party Risk"
          ]
        },
        {
          title: "Module 3: End-to-End Banking Journey & LADA Credit Modelling (Hands-On)",
          description: "Use case prioritization matrix, LADA credit risk platform, and thin-file data strategies.",
          sessions: [
            "Session 9: The End-to-End AI Banking Journey & Maturity Assessment Model",
            "Session 10: The AI Use Case Catalogue & Effort-Impact Prioritisation Matrix",
            "Session 11: LADA Methodology: Game Theory of Default & 360° Valuation Theory",
            "Session 12: LADA Hands-On Credit Modelling: SME/Retail Data Ingestion & EWS Run",
            "Session 13: The India Data Stack: AA, ULI, GSTN, AgriStack & DPI Moat Strategy",
            "Session 14: Handling Thin-File Data: GAN Synthetic Data, SMOTE & Federated Learning"
          ]
        },
        {
          title: "Module 4: Fraud Detection, RegTech & Responsible AI",
          description: "MuleHunter.AI, UPI fraud detection, DPDP compliance, and sectoral AI adoption.",
          sessions: [
            "Session 15: Fraud Detection & Anomaly Engines: MuleHunter.AI & Graph Neural Networks",
            "Session 16: LegalTech & Cybersecurity: Contract Review AI & Deepfake-Resistant KYC",
            "Session 17: The AI Adoption Roadmap: Pilot-to-Production Framework & ROI Calculation",
            "Session 18: Ethics, Algorithmic Bias & Responsible AI (SHAP by Demographic & DPDP Sec 12)",
            "Session 19: Sectoral AI: Retail, Corporate, Supply Chain & Rural Banking (AgriStack)",
            "Session 20: Wealth & Asset Management: Robo-Advisory, BlackRock Aladdin & Course Synthesis"
          ]
        }
      ]
    },

    {
      id: 'course_ai_powered_startup_incubation',
      title: 'AI-Powered Startup Incubation',
      slug: 'ai-powered-startup-incubation',
      category: 'Business',
      level: 'Executive',
      price: 5999,
      originalPrice: 11999,
      duration: 1800,
      rating: 4.8,
      ratingCount: 135,
      badge: 'EXECUTIVE',
      introVideoUrl: 'https://drive.usercontent.google.com/download?export=download&id=1R7eBfiWtW0ihmKz1XMiDNkJA89svoIz1&confirm=t',
      syllabusUrl: '/flyers/Flyer_AI_Startup_Bcshool_30hr_Course.pdf',
      shortDescription: 'Build a startup with a clear path from idea to working product by combining business fundamentals with modern AI development.',
      description: `Overview:
Build a startup with a clear path from idea to working product. This program combines business fundamentals with modern AI development so you can validate an opportunity, design the product, build an MVP, and take it toward real deployment.

What You Will Learn:
• Validate ideas using customer problems, market research, and structured opportunity analysis.
• Build a practical Lean Canvas and define a focused go-to-market strategy.
• Estimate TAM, SAM, and SOM and connect market size to business decisions.
• Design AI-enabled products using APIs, modern AI workflows, and data pipelines.
• Build and refine a functional MVP with an emphasis on usability and measurable value.
• Deploy a production-ready application and understand the fundamentals of operating it.
• Prepare financial assumptions, an investor narrative, and a clear product demonstration.

Practical Focus:
The course is built around execution. Learners move from business validation and product definition to prototyping, AI integration, deployment, and presentation of a working solution.

Who This Is For:
Designed for founders, aspiring entrepreneurs, product professionals, developers, and business leaders who want to understand how AI can be turned into a practical product and viable business.

Delivery Model:
• B-School Full Credit: 30 hours · 20 sessions · 90 minutes per session
• B-School Half Credit: 15 hours · 10 sessions · 90 minutes per session
• Corporate Intensive: 3–5 day format with flexible session structure
• Custom Program: Industry-specific case studies and tailored learning outcomes`,
      modules: [
        {
          title: "Module 1: Opportunity Discovery & Product Strategy (Sessions 1–4)",
          description: "Problem validation, AI persona mapping, VPC, Lean Canvas, TAM/SAM/SOM, and competitive positioning.",
          sessions: [
            "Session 1: Idea Selection & Market Sizing (TAM / SAM / SOM Canvas)",
            "Session 2: Customer Discovery & AI Persona Mapping (JTBD Interviews & AI Leverage Points)",
            "Session 3: Value Proposition & Business Model Design (VPC + Full 9-Block Lean Canvas)",
            "Session 4: Competitive Landscape & Positioning (4 AI Moat Types & Positioning Matrix)"
          ]
        },
        {
          title: "Module 2: Prototyping & MVP Building (Sessions 5–8)",
          description: "No-code MVP scoping, GCP architecture orientation, UI prototyping, Gemini/Vertex API integration, and data pipelines.",
          sessions: [
            "Session 5: No-Code MVP & GCP Orientation (3-Feature Rule & Architecture Blueprint)",
            "Session 6: UI Prototyping & User Flow Design (Progressive Disclosure & Interactive Wireframes)",
            "Session 7: AI Feature Integration: API Anatomy, System Prompts & Vertex AI (Gemini)",
            "Session 8: Data Collection & Fast-Track Python Data Pipelines (Privacy by Design)"
          ]
        },
        {
          title: "Module 3: AI Product Architecture & Compliance (Sessions 9–12)",
          description: "Build vs buy analysis, advanced prompt engineering, RAG pipelines, DPDP compliance, and product analytics.",
          sessions: [
            "Session 9: AI Product Strategy (Build/Buy/API Analysis & 7 Failure Modes)",
            "Session 10: Prompt Engineering for Product Builders (Chain-of-Thought & Evaluation Rubric)",
            "Session 11: Responsible AI & Legal Compliance (EU AI Act, DPDP Act 2023 & Bias Testing)",
            "Session 12: Metrics, Analytics & AI Feedback Loops (AARRR Funnel & Hallucination Tracking)"
          ]
        },
        {
          title: "Module 4: Go-to-Market & Financial Strategy (Sessions 13–16)",
          description: "GTM strategy, pricing models, 18-month financial modeling, fundraising simulation, and 12-slide Sequoia pitch deck.",
          sessions: [
            "Session 13: Go-to-Market Strategy (PLG / SLG / CLG Frameworks & Prospecting Assets)",
            "Session 14: Pricing Strategy & Financial Modelling (Value-Based Pricing & 18-Month P&L Model)",
            "Session 15: Fundraising & Investment Readiness (5 AI Investor Criteria & Due Diligence Simulation)",
            "Session 16: Pitch Deck Construction (Full 12-Slide Sequoia AI Structure + Loom Recording)"
          ]
        },
        {
          title: "Module 5: Cloud Deployment & Demo Day Showcase (Sessions 17–20)",
          description: "GCP Cloud Run deployment, security auditing, pre-mortem rehearsal, and Live MVP Demo Day showcase.",
          sessions: [
            "Session 17: GCP Architecture & Cloud Run Deployment (Live URL Provisioning)",
            "Session 18: Security, Scalability & Cost Optimisation (Secret Manager & Auto-Scaling)",
            "Session 19: Final Refinements & Full Dress Rehearsal (Pre-Mortem & Q&A Defense Prep)",
            "Session 20: DEMO DAY — Live GCP MVP Showcase & Investor/Faculty Evaluation Panel"
          ]
        }
      ]
    }
  ];

  // 3. Loop and update Course records, remove old modules, and re-create structured 20-session modules & lessons
  for (const c of courses) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Processing: ${c.title}...`);

    // Upsert Course
    const courseRecord = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        shortDescription: c.shortDescription,
        category: c.category,
        level: c.level,
        badge: c.badge,
        isFeatured: true,
        price: c.price,
        originalPrice: c.originalPrice,
        pricing_type: 'PAID',
        duration: c.duration,
        rating: c.rating,
        ratingCount: c.ratingCount,
        introVideoUrl: c.introVideoUrl,
        syllabusUrl: c.syllabusUrl,
        instructorId: instructorId,
        isActive: true,
        isPublished: true,
        publish_state: 'published',
        updatedAt: new Date()
      },
      create: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        shortDescription: c.shortDescription,
        category: c.category,
        level: c.level,
        badge: c.badge,
        isFeatured: true,
        price: c.price,
        originalPrice: c.originalPrice,
        pricing_type: 'PAID',
        duration: c.duration,
        rating: c.rating,
        ratingCount: c.ratingCount,
        introVideoUrl: c.introVideoUrl,
        syllabusUrl: c.syllabusUrl,
        instructorId: instructorId,
        isActive: true,
        isPublished: true,
        publish_state: 'published'
      }
    });

    console.log(`  ✅ Updated Course Record (ID: ${courseRecord.id})`);
    console.log(`     Intro Video: ${c.introVideoUrl}`);
    console.log(`     Syllabus PDF: ${c.syllabusUrl}`);

    // Clean existing lessons & modules for this course to ensure pristine 20-session syllabus structure
    await prisma.lesson.deleteMany({
      where: { courseId: c.id }
    });

    await prisma.module.deleteMany({
      where: { courseId: c.id }
    });

    let modOrder = 1;
    let globalLessonOrder = 1;

    for (const mod of c.modules) {
      const createdMod = await prisma.module.create({
        data: {
          title: mod.title,
          description: mod.description,
          order: modOrder++,
          courseId: c.id
        }
      });

      for (const sessionTitle of mod.sessions) {
        await prisma.lesson.create({
          data: {
            title: sessionTitle,
            content: `In this session, students explore: ${sessionTitle}. Facilitated by Soumya Dasgupta (MBA IIM Calcutta, FRM®). Hands-on executive learning and practical decision framework.`,
            duration: 90, // 90 minutes
            orderNumber: globalLessonOrder++,
            isPublished: true,
            isFreePreview: globalLessonOrder === 2, // First session previewable
            moduleId: createdMod.id,
            courseId: c.id
          }
        });
      }
    }

    console.log(`  📚 Created ${c.modules.length} modules with ${globalLessonOrder - 1} sessions for ${c.title}`);
  }

  clearResiliencyCache();
  console.log('\n🎉 Complete seeding of Soumya Dasgupta Executive Masterclasses finished successfully!');
}

seedCompleteSoumyaCourses()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
