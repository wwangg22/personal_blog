'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Link from 'next/link';



const validateEmail = (email: String) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  const validateUsername = (username: String) => {
    return String(username).match(/[^0-9\w]/g);
  };
  
const Sign1 = () => {
  
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorfields, setErrorfields] = useState("");
    const [inputError, setInputError] = useState(false);
    const [user, setUser] = useState({
      email: "",
      password: "",
      isVerified: false,
      isAdmin: false,
    });
    const [buttonDisabled, setButtonDisabled] = useState(false);
    useEffect(() => {
      if (
        user.email.length > 0 &&
        user.password.length > 0
      ) {
        setButtonDisabled(false);
      } else {
        setButtonDisabled(true);
      }
    }, [user]);
    const onSubmit = async (e: React.SyntheticEvent) => {
      setLoading(true);
      e.preventDefault();
      try {
  
        const response = await axios.post(`/api/signup`, user);
        if (response.status === 200) {
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
      setErrorMessage("");
      setInputError(false);
    };
    return (
      <div
        className={"flex flex-col items-center justify-center h-0.75 p-5 w-full"}
      >
        <h1 className={"text-2xl my-16"}>Sign Up</h1>
        <label htmlFor={"email"}>Email</label>
        <div>
          <input
            className={`text-black my-4 p-2 rounded ${
              inputError && (errorfields == "email" || errorfields == "all")
                ? "border-[#9B2006] border-2"
                : "border border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-white`}
            type={"text"}
            id={"email"}
            placeholder={"Email"}
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
          {errorMessage && (errorfields == "email" || errorfields == "all") && (
            <div className={"text-[#9B2006] text-sm mb-2"}>{errorMessage}</div>
          )}
        </div>
        <label htmlFor={"password"}>Password</label>
        <div>
          <input
            className={`text-black my-4 p-2 rounded ${
              inputError && (errorfields == "password" || errorfields == "all")
                ? "border-[#9B2006] border-2"
                : "border border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-white`}
            type={"password"}
            id={"password"}
            placeholder={"Password"}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
          {errorMessage &&
            (errorfields == "password" || errorfields == "all") && (
              <div className={"text-[#9B2006] text-sm mb-2"}>{errorMessage}</div>
            )}
        </div>
        <button
          className={
            "mt-4 border-2 border-white py-2 rounded hover:bg-white hover:text-black p-2 cursor-pointer"
          }
          onClick={onSubmit}
          disabled={buttonDisabled}
        >
          {loading ? 'loading' : "Sign Up"}
        </button>
        <Link className={"text-sm my-2"} href={"/signin"}>
          Already have an account? Login
        </Link>
      </div>
    );
  };
  
  
export default Sign1;
  