"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Search, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  courseTitle?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contactId: string) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onSelectContact,
}: NewConversationModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages/available-contacts");
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "TEACHER":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden m-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#174F3A] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#174F3A]/20">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight font-outfit">New Evolution</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 sm:px-8 pb-4 sm:pb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#174F3A] transition-colors" />
            <input
              type="text"
              placeholder="Locate mentor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-[#174F3A]/20 rounded-2xl text-[12px] font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#174F3A]/5 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-96 overflow-y-auto px-4 pb-8 space-y-2 student-scrollbar">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#174F3A]/10 border-t-[#174F3A] rounded-full mx-auto" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">
                {searchQuery
                  ? "No frequency detected"
                  : "No mentors available"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelectContact(contact.id);
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl text-left hover:bg-white hover:shadow-xl hover:shadow-[#174F3A]/5 transition-all flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {contact.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={contact.image}
                          alt={contact.name || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="font-black text-[#174F3A] text-xs uppercase tracking-widest">{(contact.name?.[0] || "?")}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-black text-gray-900 truncate text-[14px] uppercase font-outfit tracking-tight">
                        {contact.name || contact.email || "Unknown"}
                      </h3>
                      <span
                        className={cn(
                          "text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest shrink-0",
                          getRoleBadgeColor(contact.role)
                        )}
                      >
                        {contact.role}
                      </span>
                    </div>
                    {contact.courseTitle && (
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[1px] truncate">
                        {contact.courseTitle}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

