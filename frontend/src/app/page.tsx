"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("auth_token");

    if (token) {
      router.push("/list");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className={styles.page}>
      {/* Optional: add a loading spinner/message while redirecting */}
    </div>
  );
}
