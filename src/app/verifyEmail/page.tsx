"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"


async function page() {
    const searchParams = useSearchParams()
    const secret = searchParams.get("secret")
    const email = searchParams.get("email")
    const router = useRouter()
    if (!secret || !email) {
        return (
            <div>
                <h1>Invalid verification link</h1>
            </div>
        )
    }
    useEffect(() => {
        async function handleVerifyEmail() {
            try {
                const res = await axios.get(`/api/verifyEmail?email=${email}&secret=${secret}`)
                if (res.data.success) {
                    toast.success(res.data.message)
                    router.push("/login")
                    return
                }
                toast.error(res.data.message)
                router.push("/login")
                return
            } catch (error) {
                toast.error("Error occure in verifing user | try again")
                router.push("/login")
                return
            }
        }
        handleVerifyEmail()
    }, [])
    return (
        <div>
            <h1>Verify</h1>
        </div>
    )
}

export default page