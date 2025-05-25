'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const Login: React.FC = () => {
    const router = useRouter();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [inputError, setInputError] = useState(false);
    const [errorfields, setErrorfields] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0) {
        setButtonDisabled(false);
        } else {
        setButtonDisabled(true);
        }
    }, [user]);
    const onSubmit = async (e: React.SyntheticEvent) => {
        setLoading(true);
        setInputError(false); // Reset input error flag
        setErrorMessage(""); // Clear any existing error messages
        e.preventDefault();
        try {
            const { status } = await axios.post('/api/login', user);
      
            if (status === 200) {
              
              router.push('/blog');
              return; // stop execution, no need to run finally‑block code below
            }
          } catch (error: unknown) {
            const statusCode =
              typeof error === 'object' && error && 'response' in error
                ? (error as { response: { status: number } }).response.status
                : 0;
      
            if (statusCode === 400) {
              setErrorMessage('Invalid characters');
              setErrorfields('both');
            } else if (statusCode === 401) {
              setErrorMessage('Invalid credentials');
              setErrorfields('both');
            } else {
              setErrorMessage('Something went wrong, please try again');
              setErrorfields('both');
            }
            setInputError(true);
          } finally {
            setLoading(false);
          }
        };
      
    return (
        <div
        className={"flex flex-col items-center justify-center h-0.75 p-5 w-full"}
        >
        <h1 className={"text-2xl my-16"}>Login</h1>

        <label htmlFor={"email"}>Email</label>
        <div>
            <input
            className={`text-black my-4 p-2 rounded ${
                inputError && errorfields != "password"
                ? "border-[#9B2006] border-2"
                : "border border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-white`}
            type={"text"}
            id={"email"}
            placeholder={"Email"}
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            {errorMessage && errorfields != "password" && (
            <div className={"text-[#9B2006] text-sm mb-4"}>{errorMessage}</div>
            )}
        </div>
        <label htmlFor={"password"}>Password</label>
        <div>
            <input
            className={`text-black my-4 p-2 rounded ${
                inputError && errorfields != "email"
                ? "border-[#9B2006] border-2"
                : "border border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-white`}
            type={"password"}
            id={"password"}
            placeholder={"Password"}
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            {errorMessage && errorfields != "email" && (
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
            {loading ? "loading" : "Login"}
        </button>
        <Link className={"text-sm my-2"} href={"/signup"}>
            Don&apos;t have an account? Sign Up
        </Link>
    </div>
    );
};

export default Login;