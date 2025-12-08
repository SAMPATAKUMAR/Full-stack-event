// import React, { useEffect } from 'react';
// import { auth } from '../firebase';
// import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
// export default function Auth({ onUser }){
//   useEffect(()=>{
//     const unsub = onAuthStateChanged(auth, (u)=> onUser(u || null));
//     return () => unsub();
//   },[]);
//   const signIn = async ()=> {
//     const provider = new GoogleAuthProvider();
//     await signInWithPopup(auth, provider);
//   };
//   return (<div className="auth"><button onClick={signIn}>Sign in with Google</button></div>);
// }