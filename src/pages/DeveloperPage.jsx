import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Code2 } from 'lucide-react';

export default function DeveloperPage() {
    const navigate = useNavigate();

    // Explicitly tracks which card the mouse is currently pointing at
    const [hoveredCardId, setHoveredCardId] = useState(null);

    // Team data array
    const teamMembers = [
        {
            id: 1,
            name: "Soham Fegade",
            role: "Website Developer",
            image: "https://ik.imagekit.io/ns4gfx2mi/Personal/profile.jpeg?updatedAt=1775370188351",
            github: "https://github.com/sohamfegade",
            linkedin: "https://linkedin.com/in/soham-fegade",
        },
        {
            id: 2,
            name: "Atharva Jadhav",
            role: "Website Developer",
            image: "https://ik.imagekit.io/ns4gfx2mi/Personal/atharva.jpg?updatedAt=1775370006610",
            github: "https://github.com/atharvajadhav2205",
            linkedin: "https://www.linkedin.com/in/atharvajadhav22",
        },
        {
            id: 3,
            name: "Harsh Bhendarkar",
            role: "Website Developer",
            image: "https://ik.imagekit.io/ns4gfx2mi/Personal/harsh.jpg?updatedAt=1775370006449",
            github: "https://github.com/Bharsh25",
            linkedin: "https://www.linkedin.com/in/harsh-bhendarkar-a70841301",
        },
        {
            id: 4,
            name: "Shivam Awate",
            role: "Website Developer",
            image: "https://ik.imagekit.io/ns4gfx2mi/Personal/shivam.jpg?updatedAt=1775370006245",
            github: "https://github.com/ShivamAwate0903",
            linkedin: "https://www.linkedin.com/in/shivam-awate",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Meet Our Developers</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        The minds behind EventHub. We are passionate about building modern, intuitive, and scalable solutions.
                    </p>
                </div>

                {/* Added items-start here to prevent sibling cards from stretching when one expands */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {teamMembers.map((member) => {
                        // Check if THIS specific card is the one being hovered
                        const isHovered = hoveredCardId === member.id;

                        return (
                            <div
                                key={member.id}
                                // Mouse events trigger the state update for this exact card
                                onMouseEnter={() => setHoveredCardId(member.id)}
                                onMouseLeave={() => setHoveredCardId(null)}
                                className={`bg-white rounded-3xl border border-slate-100 overflow-hidden relative transition-all duration-300 ease-out ${isHovered
                                    ? 'shadow-2xl md:-translate-y-2' // Floating effect ONLY on hovered card
                                    : 'shadow-lg shadow-slate-200/50'
                                    }`}
                            >

                                <div className={`h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative transition-all duration-300 ${isHovered ? 'brightness-110' : ''}`}>
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>

                                <div className="px-8 pb-8 relative flex flex-col items-center">
                                    <div className={`w-24 h-24 bg-white rounded-full p-1.5 absolute -top-12 shadow-md flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden">
                                            {member.image ? (
                                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Code2 className="w-10 h-10 text-slate-400" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-14 text-center w-full">
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{member.name}</h2>
                                        <p className="text-sm font-medium text-blue-600 mt-1">{member.role}</p>

                                        {/* State-controlled expansion */}
                                        <div
                                            className={`w-full overflow-hidden transition-all duration-500 ease-in-out ${isHovered
                                                ? 'max-h-32 opacity-100' // Open if hovered
                                                : 'max-h-32 opacity-100 md:max-h-0 md:opacity-0' // Collapsed on laptop, open on mobile
                                                }`}
                                        >
                                            <div className="mt-6 flex justify-center gap-4 pt-6 border-t border-slate-100">
                                                <a
                                                    href={member.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center p-3.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-md transform hover:scale-110"
                                                    title="GitHub"
                                                >
                                                    <Github className="w-5 h-5" />
                                                </a>
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center p-3.5 bg-[#0A66C2] text-white rounded-full hover:bg-[#004182] transition-all shadow-md transform hover:scale-110"
                                                    title="LinkedIn"
                                                >
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}