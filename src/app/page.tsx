import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Decorative background circles */}
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <main className={`glass-panel animate-fade-in ${styles.main}`}>
        <div className={styles.hero}>
          <div className={styles.emblem}>🏛️</div>
          <h1 className={styles.title}>Sachivalayam Platform</h1>
          <p className={styles.subtitle}>
            A unified digital governance ecosystem. Connecting citizens with essential schemes, enabling rapid local issue resolution, and providing real-time oversight for higher authorities.
          </p>
          
          <div className={styles.ctaContainer}>
            <Link href="/auth" className={`${styles.btn} ${styles.btnPrimary}`}>
              Enter Portal
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <h3>👤 For Citizens</h3>
            <p>Report local issues, track government scheme eligibility, and connect with your local representatives instantly.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>🧑‍💼 For Secretaries</h3>
            <p>Manage village reports, resolve citizen grievances, and monitor scheme distribution effectively.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>🔭 For Optimizers</h3>
            <p>MROs and MPDOs can monitor village performance, identify bottlenecks, and flag issues for higher authorities.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>🏛️ For Authorities</h3>
            <p>State and Central leadership gain real-time insights into district performance and scheme delivery gaps.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
