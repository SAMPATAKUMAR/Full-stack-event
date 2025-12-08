import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
import "../style/verifyemail.css"; // make sure this path matches your folder

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cooldown, setCooldown] = useState(30);
  const [verified, setVerified] = useState(false);

  // Listen for auth changes and send initial verification email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.emailVerified) {
          try {
            await sendEmailVerification(currentUser);
            toast.info("Verification email sent. Please check your inbox.");
          } catch (err) {
            console.error(err);
            toast.error("Failed to send verification email.");
          }
        } else {
          // If already verified, skip screen
          setVerified(true);
          navigate("/dashboard");
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Resend email handler with cooldown
  const handleResendEmail = async () => {
    if (user && cooldown === 0) {
      try {
        await sendEmailVerification(user);
        toast.info("Verification email resent.");
        setCooldown(30);
      } catch (err) {
        console.error(err);
        toast.error("Failed to resend email.");
      }
    }
  };

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(
        () => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)),
        1000
      );
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Poll for email verification only when user exists
  useEffect(() => {
    if (!user) return;

    const poll = setInterval(async () => {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(poll);
        setVerified(true);
        toast.success("Email verified!");
        navigate("/dashboard");
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [user, navigate]);

  // progress (0–100) based on cooldown, purely for UI
  const progressPercent = ((30 - cooldown) / 30) * 100;

  return (
    <div className="verify-email-page">
      <h2>Please verify your email</h2>

      <p>
        We’ve sent a verification link to your email. Once verified, you’ll be
        redirected to the dashboard.
      </p>
      <h4 className="verify-subtitle">Please also check your spam folder.</h4>

      <button
        onClick={handleResendEmail}
        disabled={cooldown > 0}
        className={`verify-btn ${cooldown > 0 ? "disabled" : "active"}`}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
      </button>

      {/* Progress bar using your CSS */}
      <div className="progress-container">
        <div
          className={`progress-bar ${verified ? "green" : "blue"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Spinner while waiting */}
      {!verified && (
        <div className="spinner">
          <div className="spinner-icon" />
          <span className="spinner-text">Waiting for verification...</span>
        </div>
      )}

      {verified && <Confetti recycle={false} numberOfPieces={300} />}
    </div>
  );
};

export default VerifyEmail;
