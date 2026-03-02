import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();

    // Tabs
    const [activeTab, setActiveTab] = useState("profile");

    // Profile state
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "", mobileNumber: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    // Addresses state
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: "", mobileNumber: "", addressLine1: "", addressLine2: "",
        city: "", state: "", postalCode: "", country: "India", isDefault: false,
    });

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!authUser) {
            navigate("/login");
            return;
        }
        fetchProfile();
        fetchAddresses();
    }, [authUser]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/user/profile");
            setProfile(res.data);
            setProfileForm({
                name: res.data.name || "",
                email: res.data.email || "",
                mobileNumber: res.data.mobileNumber || "",
            });
        } catch (err) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get("/addresses");
            setAddresses(res.data);
        } catch (err) {
            console.error("Failed to load addresses");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = { ...profileForm };

            if (showPasswordSection && passwordForm.newPassword) {
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    setError("Passwords do not match");
                    setSaving(false);
                    return;
                }
                if (passwordForm.newPassword.length < 6) {
                    setError("Password must be at least 6 characters");
                    setSaving(false);
                    return;
                }
                payload.currentPassword = passwordForm.currentPassword;
                payload.newPassword = passwordForm.newPassword;
            }

            const res = await axios.put("/user/profile", payload);
            setProfile(res.data);
            setProfileForm({
                name: res.data.name,
                email: res.data.email,
                mobileNumber: res.data.mobileNumber || "",
            });
            setEditMode(false);
            setShowPasswordSection(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            fullName: "", mobileNumber: "", addressLine1: "", addressLine2: "",
            city: "", state: "", postalCode: "", country: "India", isDefault: false,
        });
        setEditingAddress(null);
        setShowAddressForm(false);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            if (editingAddress) {
                await axios.put(`/addresses/${editingAddress}`, addressForm);
                setSuccess("Address updated!");
            } else {
                await axios.post("/addresses", addressForm);
                setSuccess("Address added!");
            }
            fetchAddresses();
            resetAddressForm();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save address");
        } finally {
            setSaving(false);
        }
    };

    const handleEditAddress = (addr) => {
        setAddressForm({
            fullName: addr.fullName,
            mobileNumber: addr.mobileNumber,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || "",
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country || "India",
            isDefault: addr.isDefault,
        });
        setEditingAddress(addr._id);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await axios.delete(`/addresses/${id}`);
            fetchAddresses();
            setSuccess("Address deleted");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to delete address");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.put(`/addresses/${id}`, { isDefault: true });
            fetchAddresses();
        } catch (err) {
            setError("Failed to set default address");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-yellow-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        {
            id: "profile", label: "My Profile", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            )
        },
        {
            id: "addresses", label: "Addresses", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            )
        },
        {
            id: "orders", label: "My Orders", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            )
        },
    ];

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif italic text-gray-800 mb-1">My Account</h1>
                <p className="text-gray-400 text-sm">Manage your profile, addresses, and preferences</p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 mt-3 rounded-full" />
            </div>

            {/* Alerts */}
            {success && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl mb-5">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-green-700 text-sm">{success}</p>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-5">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ── Sidebar ── */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center text-white text-2xl font-serif mb-3 shadow-lg shadow-yellow-700/20">
                                {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <h3 className="text-gray-800 font-medium text-sm">{profile?.name}</h3>
                            <p className="text-gray-400 text-xs mt-0.5">{profile?.email}</p>
                        </div>

                        <div className="w-full h-px bg-gray-100 mb-4" />

                        {/* Navigation */}
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.id === "orders") { navigate("/orders"); return; }
                                        setActiveTab(tab.id);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-yellow-800 shadow-sm"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="w-full h-px bg-gray-100 my-4" />

                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="flex-1">
                    {/* ═══ PROFILE TAB ═══ */}
                    {activeTab === "profile" && (
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-serif italic text-gray-800">Personal Information</h2>
                                    <p className="text-gray-400 text-xs mt-1">Manage your personal details</p>
                                </div>
                                {!editMode && (
                                    <button onClick={() => setEditMode(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="w-full h-px bg-gray-100 mb-6" />

                            {!editMode ? (
                                /* ── View Mode ── */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</p>
                                        <p className="text-gray-800 font-medium">{profile?.name || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</p>
                                        <p className="text-gray-800 font-medium">{profile?.email || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mobile Number</p>
                                        <p className="text-gray-800 font-medium">{profile?.mobileNumber || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Type</p>
                                        <p className="text-gray-800 font-medium capitalize">{profile?.googleId ? "Google Account" : "Email Account"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Member Since</p>
                                        <p className="text-gray-800 font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                                    </div>
                                </div>
                            ) : (
                                /* ── Edit Mode ── */
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                            <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required
                                                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required
                                                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                            <input type="tel" value={profileForm.mobileNumber} onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                        </div>
                                    </div>

                                    {/* Password change toggle */}
                                    {!profile?.googleId && (
                                        <div className="pt-2">
                                            <button type="button" onClick={() => setShowPasswordSection(!showPasswordSection)}
                                                className="text-sm text-yellow-700 hover:text-yellow-800 font-medium flex items-center gap-1 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                                {showPasswordSection ? "Cancel Password Change" : "Change Password"}
                                            </button>

                                            {showPasswordSection && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                                        <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                                        <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} minLength={6}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                                        <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={saving}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                            {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : "Save Changes"}
                                        </button>
                                        <button type="button" onClick={() => { setEditMode(false); setShowPasswordSection(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setProfileForm({ name: profile.name, email: profile.email, mobileNumber: profile.mobileNumber || "" }); }}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ═══ ADDRESSES TAB ═══ */}
                    {activeTab === "addresses" && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-serif italic text-gray-800">Delivery Addresses</h2>
                                    <p className="text-gray-400 text-xs mt-1">Manage your delivery addresses</p>
                                </div>
                                {!showAddressForm && (
                                    <button onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-700 to-yellow-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-yellow-700/20 hover:shadow-yellow-800/30 transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                        Add New Address
                                    </button>
                                )}
                            </div>

                            {/* Address Form */}
                            {showAddressForm && (
                                <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-8 mb-6">
                                    <h3 className="text-lg font-serif italic text-gray-800 mb-5">
                                        {editingAddress ? "Edit Address" : "Add New Address"}
                                    </h3>
                                    <div className="w-12 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 mb-6 rounded-full" />

                                    <form onSubmit={handleSaveAddress} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                                <input type="text" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} required
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                                <input type="tel" value={addressForm.mobileNumber} onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })} required
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Address Line 1</label>
                                            <input type="text" value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} required placeholder="House/Flat No., Building, Street"
                                                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Address Line 2 <span className="text-gray-300 normal-case">(optional)</span></label>
                                            <input type="text" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} placeholder="Landmark, Area"
                                                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">City</label>
                                                <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">State</label>
                                                <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Postal Code</label>
                                                <input type="text" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} required
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Country</label>
                                                <input type="text" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all" />
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" />
                                            <span className="text-sm text-gray-600">Set as default delivery address</span>
                                        </label>

                                        <div className="flex gap-3 pt-2">
                                            <button type="submit" disabled={saving}
                                                className="px-6 py-3 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 hover:from-yellow-800 hover:via-yellow-700 hover:to-yellow-800 text-white text-sm font-medium uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-700/20 transition-all disabled:opacity-50 flex items-center gap-2">
                                                {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : (editingAddress ? "Update Address" : "Save Address")}
                                            </button>
                                            <button type="button" onClick={resetAddressForm}
                                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Address List */}
                            {addresses.length === 0 && !showAddressForm ? (
                                <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100/80 p-12 text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                    <p className="text-gray-500 mb-1">No addresses saved yet</p>
                                    <p className="text-gray-400 text-sm">Add a delivery address to get started</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {addresses.map((addr) => (
                                        <div key={addr._id} className={`bg-white rounded-2xl shadow-lg shadow-gray-100/50 border p-6 transition-all hover:shadow-xl ${addr.isDefault ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-100/80"}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-gray-800 font-medium">{addr.fullName}</h4>
                                                        {addr.isDefault && (
                                                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 && <>, {addr.addressLine2}</>}
                                                        <br />
                                                        {addr.city}, {addr.state} — {addr.postalCode}
                                                        <br />
                                                        {addr.country}
                                                    </p>
                                                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                                                        {addr.mobileNumber}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 ml-4">
                                                    {!addr.isDefault && (
                                                        <button onClick={() => handleSetDefault(addr._id)} title="Set as default"
                                                            className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEditAddress(addr)} title="Edit"
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteAddress(addr._id)} title="Delete"
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
