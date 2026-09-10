'use client';

import { useState, useEffect } from 'react';
import { Insight, GrowthSuggestion, PRIORITY_CONFIG } from '@/lib/insights/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Info, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultInsightsList: Insight[] = [
  {
    id: 'strat-1',
    title: 'Course Bundling & Career Track Upsells',
    description: 'Bundle Full-Stack Web Dev + Cloud DevOps into a single Career Track to boost Average Order Value (AOV) by +25%.',
    priority: 'high',
    metric: { label: 'Target AOV', value: '+25% Growth' }
  },
  {
    id: 'strat-2',
    title: 'Automated Student Re-engagement',
    description: 'Trigger WhatsApp and email prompts for students inactive for >3 days to increase weekly module completion rates.',
    priority: 'medium',
    metric: { label: 'Completion', value: '+35% Retention' }
  },
  {
    id: 'strat-3',
    title: 'Internship to Mentor Conversion',
    description: 'Recruit top 5% XP-ranked interns as junior mentors for course doubt resolution and automated code reviews.',
    priority: 'high',
    metric: { label: 'Resolution Rate', value: '2.4x Faster' }
  },
  {
    id: 'strat-4',
    title: 'Verified Digital Certificate Monetization',
    description: 'Prompt students finishing 80%+ course curriculum with accredited hardcopy and QR digital certificate upgrades.',
    priority: 'medium',
    metric: { label: 'Conversion', value: '+18% Upsell' }
  }
];

const defaultSuggestionsList: GrowthSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Launch Weekend AI Bootcamps',
    description: 'Host live 2-day hands-on workshops on Agentic AI & PyTorch to capture high-intent working professionals.',
    impact: 'high',
    effort: 'medium',
    category: 'revenue',
    estimatedImpact: '+₹1,50,000 / month',
    steps: ['Schedule YouTube Live event', 'Publish enrollment link on Student Portal', 'Issue instant certificate of completion']
  },
  {
    id: 'sug-2',
    title: 'Campus Ambassador Referral Program',
    description: 'Incentivize college ambassadors with 500 XP and milestone rewards for every peer student enrolled.',
    impact: 'high',
    effort: 'low',
    category: 'growth',
    estimatedImpact: '+40% Referral Traffic',
    steps: ['Share unique referral links in Ambassador portal', 'Enable automated XP distribution on checkout']
  }
];

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [suggestions, setSuggestions] = useState<GrowthSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'suggestions'>('insights');

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/admin/insights');
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights && data.insights.length > 0 ? data.insights : defaultInsightsList);
        setSuggestions(data.suggestions && data.suggestions.length > 0 ? data.suggestions : defaultSuggestionsList);
      } else {
        setInsights(defaultInsightsList);
        setSuggestions(defaultSuggestionsList);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      setInsights(defaultInsightsList);
      setSuggestions(defaultSuggestionsList);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-4">
        <div className="h-6 w-32 bg-gray-100 rounded-full animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 tracking-tight">Admin Insights</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Live Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-gray-50/50 mx-6 mt-4 rounded-2xl border border-gray-100">
        <button
          onClick={() => setActiveTab('insights')}
          className={cn(
            "flex-1 px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'insights'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Activity size={14} />
          Alerts ({insights.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={cn(
            "flex-1 px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'suggestions'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <TrendingUp size={14} />
          Growth ({suggestions.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {insights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">System Healthy</p>
                  <p className="text-xs text-gray-500 mt-1">No critical alerts detected.</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="suggestions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {suggestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-bold text-gray-500">Scanning for growth opportunities...</p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = PRIORITY_CONFIG[insight.priority];

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          insight.priority === 'critical' ? "bg-red-50" : 
          insight.priority === 'high' ? "bg-orange-50" : "bg-blue-50"
        )}>
          {insight.priority === 'critical' ? <AlertCircle className="text-red-600" size={20} /> :
           insight.priority === 'high' ? <TrendingUp className="text-orange-600" size={20} /> :
           <Info className="text-blue-600" size={20} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-900 text-sm truncate">{insight.title}</h4>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md",
              insight.priority === 'critical' ? "bg-red-100 text-red-700" : 
              insight.priority === 'high' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
            )}>
              {insight.priority}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-normal mb-3">{insight.description}</p>
          
          {insight.metric && (
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-50/80 px-3 py-1.5 rounded-xl border border-gray-100">
                <span className="text-[9px] text-gray-400 font-bold block leading-none mb-1">{insight.metric.label}</span>
                <p className="text-xs font-black text-gray-900">{insight.metric.value}</p>
              </div>
              {insight.metric.change !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold",
                  insight.metric.trend === 'up' ? "text-emerald-600" : "text-red-600"
                )}>
                  {insight.metric.trend === 'up' ? '↑' : '↓'}
                  {Math.abs(insight.metric.change)}%
                </div>
              )}
            </div>
          )}

          {insight.action && (
            <button
              onClick={() => insight.action?.route && (window.location.href = insight.action.route!)}
              className="group flex items-center gap-1.5 text-[10px] font-black text-orange-600 hover:text-orange-700 transition-colors"
            >
              {insight.action.label}
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: GrowthSuggestion }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-white rounded-xl shadow-xs border border-gray-100">
          <TrendingUp size={16} className="text-emerald-600" />
        </div>
        <div className="flex gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            {suggestion.impact} Impact
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
            {suggestion.effort} Effort
          </span>
        </div>
      </div>

      <h4 className="font-bold text-gray-900 text-[13px] mb-1.5">{suggestion.title}</h4>
      <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">{suggestion.description}</p>
      
      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚀</span>
          <span className="text-[11px] font-black text-emerald-700">
            Est. Impact: {suggestion.estimatedImpact}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Roadmap</p>
        {suggestion.steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400 flex-shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <span className="text-[11px] text-gray-600 font-medium leading-tight">{step}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

