/**
 * AGENT #4: TIMELINE ARCHITECT
 * 
 * Builds a forensic timeline of all events, organizing evidence chronologically,
 * identifying patterns, establishing causation chains, and creating visual timelines.
 * 
 * Key capabilities:
 * - Chronological event extraction from narrative
 * - Evidence correlation with timeline events
 * - Pattern identification (delays, retaliation, escalation)
 * - Causation chain establishment
 * - Critical date identification
 * - Timeline gap detection
 * - Visual timeline generation
 */

import OpenAI from 'openai';
import { z } from 'zod';

// Timeline event schema
const TimelineEventSchema = z.object({
  date: z.string().describe('ISO date or human date like "June 2024"'),
  dateType: z.enum(['exact', 'approximate', 'range']),
  category: z.enum([
    'lease_signed',
    'move_in',
    'issue_discovered',
    'tenant_complaint',
    'landlord_response',
    'landlord_delay',
    'escalation',
    'repair_attempt',
    'repair_failure',
    'health_impact',
    'financial_impact',
    'retaliation',
    'notice_sent',
    'legal_action',
    'evidence_created',
    'other'
  ]),
  description: z.string(),
  participants: z.array(z.string()).describe('People involved'),
  evidenceIds: z.array(z.string()).optional().describe('Related evidence'),
  significance: z.enum(['critical', 'important', 'supporting', 'minor']),
  legalRelevance: z.string().describe('Why this event matters legally'),
  notes: z.string().optional()
});

const PatternSchema = z.object({
  patternType: z.enum([
    'delay_pattern',
    'retaliation_pattern',
    'escalation_pattern',
    'bad_faith',
    'repeated_failures',
    'systematic_neglect'
  ]),
  description: z.string(),
  eventsInvolved: z.array(z.number()).describe('Indices of events'),
  legalImplication: z.string(),
  strength: z.number().min(0).max(10)
});

const CausationChainSchema = z.object({
  chainId: z.string(),
  title: z.string(),
  events: z.array(z.object({
    eventIndex: z.number(),
    role: z.enum(['cause', 'intermediate', 'effect'])
  })),
  causationType: z.enum(['direct', 'proximate', 'foreseeable']),
  legalTheory: z.string(),
  strength: z.number().min(0).max(10)
});

const TimelineAnalysisSchema = z.object({
  events: z.array(TimelineEventSchema),
  totalEvents: z.number(),
  timespan: z.object({
    start: z.string(),
    end: z.string(),
    durationDays: z.number()
  }),
  patterns: z.array(PatternSchema),
  causationChains: z.array(CausationChainSchema),
  criticalDates: z.array(z.object({
    date: z.string(),
    description: z.string(),
    importance: z.string()
  })),
  gaps: z.array(z.object({
    startDate: z.string(),
    endDate: z.string(),
    missingInfo: z.string(),
    impact: z.enum(['critical', 'moderate', 'minor'])
  })),
  narrativeSummary: z.string(),
  legalStrengths: z.array(z.string()),
  legalWeaknesses: z.array(z.string())
});

export default class TimelineArchitectAgent {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey || process.env.OPENAI_API_KEY });
    this.model = 'gpt-4-turbo-preview';
  }

  /**
   * Build complete timeline analysis
   */
  async buildTimeline(caseData, options = {}) {
    console.log('🕐 Timeline Architect: Building forensic timeline...');

    // Extract events from narrative
    const events = await this.extractEvents(caseData);
    
    // Sort chronologically
    const sortedEvents = this.sortEvents(events);
    
    // Calculate timespan
    const timespan = this.calculateTimespan(sortedEvents);
    
    // Identify patterns
    const patterns = await this.identifyPatterns(sortedEvents, caseData);
    
    // Build causation chains
    const causationChains = await this.buildCausationChains(sortedEvents, caseData);
    
    // Find critical dates
    const criticalDates = this.identifyCriticalDates(sortedEvents);
    
    // Detect gaps
    const gaps = this.detectTimelineGaps(sortedEvents, caseData);
    
    // Generate narrative summary
    const narrativeSummary = await this.generateNarrativeSummary(
      sortedEvents,
      patterns,
      causationChains,
      timespan
    );
    
    // Analyze legal strengths/weaknesses
    const { legalStrengths, legalWeaknesses } = await this.analyzeLegalImplications(
      sortedEvents,
      patterns,
      gaps
    );

    const analysis = {
      events: sortedEvents,
      totalEvents: sortedEvents.length,
      timespan,
      patterns,
      causationChains,
      criticalDates,
      gaps,
      narrativeSummary,
      legalStrengths,
      legalWeaknesses
    };

    // Validate with Zod
    const validated = TimelineAnalysisSchema.parse(analysis);

    console.log(`✅ Timeline complete: ${sortedEvents.length} events, ${patterns.length} patterns identified`);
    
    return validated;
  }

  /**
   * Extract timeline events from case narrative using GPT-4
   */
  async extractEvents(caseData) {
    const prompt = `You are a forensic timeline analyst for a legal case.

CASE FACTS:
${JSON.stringify(caseData, null, 2)}

TASK: Extract ALL chronological events from this case into a detailed timeline.

For EACH event, identify:
1. Date (exact or approximate)
2. Category (lease_signed, issue_discovered, tenant_complaint, landlord_response, etc.)
3. Description (what happened)
4. Participants (who was involved)
5. Related evidence (if any)
6. Significance (critical/important/supporting/minor)
7. Legal relevance (why it matters)

Include:
- Lease signing and move-in
- When issues were first discovered
- All complaints made by tenant
- All landlord responses (or lack thereof)
- Repair attempts and failures
- Health impacts
- Financial impacts
- Any retaliation
- Evidence creation dates (photos, emails, texts)

Be thorough. Even small details can be legally significant.

Return as JSON array of events.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal timeline expert. Extract every chronological event with precision.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.events || [];
  }

  /**
   * Sort events chronologically
   */
  sortEvents(events) {
    return events.sort((a, b) => {
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);
      return dateA - dateB;
    });
  }

  /**
   * Parse various date formats into Date object
   */
  parseDate(dateStr) {
    // Try ISO format first
    let date = new Date(dateStr);
    if (!isNaN(date)) return date;

    // Try common formats
    const formats = [
      /(\w+)\s+(\d{4})/i, // "June 2024"
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // "6/15/2024"
      /(\d{4})-(\d{2})/, // "2024-06"
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        date = new Date(dateStr);
        if (!isNaN(date)) return date;
      }
    }

    // Default to today if can't parse
    return new Date();
  }

  /**
   * Calculate timespan of case
   */
  calculateTimespan(events) {
    if (events.length === 0) {
      return { start: 'Unknown', end: 'Unknown', durationDays: 0 };
    }

    const startDate = this.parseDate(events[0].date);
    const endDate = this.parseDate(events[events.length - 1].date);
    const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

    return {
      start: events[0].date,
      end: events[events.length - 1].date,
      durationDays
    };
  }

  /**
   * Identify patterns in timeline (delays, retaliation, escalation)
   */
  async identifyPatterns(events, caseData) {
    const prompt = `You are analyzing a timeline for legal patterns.

TIMELINE EVENTS:
${JSON.stringify(events, null, 2)}

CASE CONTEXT:
${JSON.stringify(caseData, null, 2)}

TASK: Identify patterns that strengthen the legal case.

Look for:
1. **Delay Patterns** - Landlord repeatedly delays repairs
2. **Retaliation Patterns** - Adverse actions after complaints
3. **Escalation Patterns** - Problem gets worse over time
4. **Bad Faith** - Landlord ignores duties, makes false promises
5. **Repeated Failures** - Multiple repair attempts fail
6. **Systematic Neglect** - Pattern of ignoring tenant rights

For each pattern:
- Type
- Description
- Events involved (array of event indices)
- Legal implication
- Strength (0-10)

Return as JSON array of patterns.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal pattern recognition expert.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.patterns || [];
  }

  /**
   * Build causation chains showing how one event led to another
   */
  async buildCausationChains(events, caseData) {
    const prompt = `You are a legal causation analyst.

TIMELINE EVENTS:
${JSON.stringify(events, null, 2)}

CASE CONTEXT:
${JSON.stringify(caseData, null, 2)}

TASK: Identify causation chains showing how the landlord's actions (or inactions) 
directly caused harm to the tenant.

For example:
- Water leak (cause) → Mold growth (intermediate) → Respiratory illness (effect)
- Failure to repair (cause) → Uninhabitable conditions (intermediate) → Forced to leave (effect)

For each chain:
- Unique ID
- Title
- Events involved with their role (cause/intermediate/effect)
- Causation type (direct/proximate/foreseeable)
- Legal theory this supports
- Strength (0-10)

These chains prove LIABILITY and DAMAGES.

Return as JSON array of causation chains.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal causation expert. Establish clear cause-and-effect relationships.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.causationChains || [];
  }

  /**
   * Identify critical dates that could affect statute of limitations, deadlines, etc.
   */
  identifyCriticalDates(events) {
    const critical = [];

    for (const event of events) {
      if (event.significance === 'critical') {
        critical.push({
          date: event.date,
          description: event.description,
          importance: event.legalRelevance
        });
      }

      // Specific event types that are always critical
      const criticalCategories = ['lease_signed', 'move_in', 'notice_sent', 'legal_action'];
      if (criticalCategories.includes(event.category)) {
        critical.push({
          date: event.date,
          description: event.description,
          importance: `${event.category} - affects deadlines and statute of limitations`
        });
      }
    }

    // Deduplicate
    const seen = new Set();
    return critical.filter(item => {
      const key = `${item.date}-${item.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Detect gaps in timeline where information is missing
   */
  detectTimelineGaps(events, caseData) {
    const gaps = [];

    // Look for large time gaps between events
    for (let i = 0; i < events.length - 1; i++) {
      const currentDate = this.parseDate(events[i].date);
      const nextDate = this.parseDate(events[i + 1].date);
      const daysBetween = (nextDate - currentDate) / (1000 * 60 * 60 * 24);

      // Gap of more than 30 days might be significant
      if (daysBetween > 30) {
        gaps.push({
          startDate: events[i].date,
          endDate: events[i + 1].date,
          missingInfo: `${Math.floor(daysBetween)}-day gap between "${events[i].description}" and "${events[i + 1].description}". What happened during this time?`,
          impact: daysBetween > 90 ? 'critical' : daysBetween > 60 ? 'moderate' : 'minor'
        });
      }
    }

    // Check for missing lease start date
    const hasLeaseDate = events.some(e => e.category === 'lease_signed' || e.category === 'move_in');
    if (!hasLeaseDate) {
      gaps.push({
        startDate: 'Unknown',
        endDate: 'Unknown',
        missingInfo: 'Lease start date not found in timeline',
        impact: 'critical'
      });
    }

    return gaps;
  }

  /**
   * Generate narrative timeline summary
   */
  async generateNarrativeSummary(events, patterns, causationChains, timespan) {
    const prompt = `Create a compelling narrative summary of this case timeline.

TIMELINE: ${timespan.durationDays} days from ${timespan.start} to ${timespan.end}
TOTAL EVENTS: ${events.length}
PATTERNS IDENTIFIED: ${patterns.length}
CAUSATION CHAINS: ${causationChains.length}

KEY EVENTS:
${events.slice(0, 10).map((e, i) => `${i + 1}. ${e.date}: ${e.description}`).join('\n')}

PATTERNS:
${patterns.map(p => `- ${p.patternType}: ${p.description}`).join('\n')}

Write a 3-paragraph narrative that:
1. Sets the scene (when/where this started)
2. Chronicles the deterioration (what went wrong, landlord failures)
3. Culminates in current state (harm suffered, legal position)

Make it compelling but factual. This will be used in legal documents.`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal writer creating compelling timeline narratives.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * Analyze legal implications of timeline
   */
  async analyzeLegalImplications(events, patterns, gaps) {
    const prompt = `Analyze the legal strengths and weaknesses of this timeline.

EVENTS: ${events.length} total
PATTERNS: ${JSON.stringify(patterns)}
GAPS: ${JSON.stringify(gaps)}

Identify:
1. LEGAL STRENGTHS - What makes this timeline strong?
   - Clear causation
   - Pattern of neglect
   - Well-documented
   - Multiple complaints
   - Escalating harm

2. LEGAL WEAKNESSES - What concerns exist?
   - Timeline gaps
   - Missing documentation
   - Potential defenses
   - Statute of limitations issues

Return JSON with two arrays: legalStrengths and legalWeaknesses`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal strategist analyzing timeline strength.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      legalStrengths: result.legalStrengths || [],
      legalWeaknesses: result.legalWeaknesses || []
    };
  }

  /**
   * Generate visual timeline (ASCII art for terminal, or data for UI)
   */
  generateVisualTimeline(timelineAnalysis, format = 'ascii') {
    if (format === 'ascii') {
      return this.generateASCIITimeline(timelineAnalysis);
    } else if (format === 'json') {
      return this.generateTimelineJSON(timelineAnalysis);
    }
  }

  /**
   * Generate ASCII timeline for terminal display
   */
  generateASCIITimeline(analysis) {
    let output = '\n';
    output += '═══════════════════════════════════════════════════════════════════\n';
    output += '                    FORENSIC TIMELINE                              \n';
    output += '═══════════════════════════════════════════════════════════════════\n\n';
    output += `Timespan: ${analysis.timespan.start} → ${analysis.timespan.end} (${analysis.timespan.durationDays} days)\n`;
    output += `Total Events: ${analysis.totalEvents}\n`;
    output += `Patterns Identified: ${analysis.patterns.length}\n`;
    output += `Causation Chains: ${analysis.causationChains.length}\n\n`;

    output += '───────────────────────────────────────────────────────────────────\n';
    output += '  CHRONOLOGICAL EVENTS\n';
    output += '───────────────────────────────────────────────────────────────────\n\n';

    for (let i = 0; i < analysis.events.length; i++) {
      const event = analysis.events[i];
      const icon = this.getEventIcon(event.category);
      const significanceLabel = this.getSignificanceLabel(event.significance);
      
      output += `${i + 1}. [${event.date}] ${icon} ${significanceLabel}\n`;
      output += `   ${event.description}\n`;
      output += `   Category: ${event.category} | Legal: ${event.legalRelevance}\n`;
      if (event.evidenceIds && event.evidenceIds.length > 0) {
        output += `   Evidence: ${event.evidenceIds.join(', ')}\n`;
      }
      output += '\n';
    }

    if (analysis.patterns.length > 0) {
      output += '───────────────────────────────────────────────────────────────────\n';
      output += '  PATTERNS IDENTIFIED\n';
      output += '───────────────────────────────────────────────────────────────────\n\n';

      for (const pattern of analysis.patterns) {
        output += `⚠️  ${pattern.patternType.toUpperCase()} (Strength: ${pattern.strength}/10)\n`;
        output += `   ${pattern.description}\n`;
        output += `   Legal Implication: ${pattern.legalImplication}\n`;
        output += `   Events: ${pattern.eventsInvolved.map(i => `#${i + 1}`).join(', ')}\n\n`;
      }
    }

    if (analysis.causationChains.length > 0) {
      output += '───────────────────────────────────────────────────────────────────\n';
      output += '  CAUSATION CHAINS\n';
      output += '───────────────────────────────────────────────────────────────────\n\n';

      for (const chain of analysis.causationChains) {
        output += `🔗 ${chain.title} (${chain.causationType} causation, strength: ${chain.strength}/10)\n`;
        output += `   Legal Theory: ${chain.legalTheory}\n`;
        output += `   Chain: `;
        const chainStr = chain.events
          .map(e => `Event #${e.eventIndex + 1} (${e.role})`)
          .join(' → ');
        output += chainStr + '\n\n';
      }
    }

    if (analysis.gaps.length > 0) {
      output += '───────────────────────────────────────────────────────────────────\n';
      output += '  TIMELINE GAPS (Potential Weaknesses)\n';
      output += '───────────────────────────────────────────────────────────────────\n\n';

      for (const gap of analysis.gaps) {
        output += `❓ ${gap.impact.toUpperCase()} IMPACT\n`;
        output += `   ${gap.missingInfo}\n`;
        output += `   Period: ${gap.startDate} to ${gap.endDate}\n\n`;
      }
    }

    output += '───────────────────────────────────────────────────────────────────\n';
    output += '  NARRATIVE SUMMARY\n';
    output += '───────────────────────────────────────────────────────────────────\n\n';
    output += analysis.narrativeSummary + '\n\n';

    output += '═══════════════════════════════════════════════════════════════════\n';

    return output;
  }

  /**
   * Generate timeline data for UI visualization
   */
  generateTimelineJSON(analysis) {
    return {
      ...analysis,
      visualization: {
        type: 'timeline',
        orientation: 'horizontal',
        markers: analysis.events.map((event, index) => ({
          id: index,
          date: event.date,
          label: event.description,
          category: event.category,
          significance: event.significance,
          icon: this.getEventIcon(event.category),
          color: this.getEventColor(event.significance)
        })),
        patterns: analysis.patterns.map(p => ({
          ...p,
          color: this.getPatternColor(p.patternType)
        }))
      }
    };
  }

  getEventIcon(category) {
    const icons = {
      lease_signed: '📝',
      move_in: '🏠',
      issue_discovered: '⚠️',
      tenant_complaint: '📢',
      landlord_response: '💬',
      landlord_delay: '⏳',
      escalation: '📈',
      repair_attempt: '🔧',
      repair_failure: '❌',
      health_impact: '🏥',
      financial_impact: '💰',
      retaliation: '⚡',
      notice_sent: '📨',
      legal_action: '⚖️',
      evidence_created: '📸',
      other: '•'
    };
    return icons[category] || '•';
  }

  getSignificanceLabel(significance) {
    const labels = {
      critical: '🔴 CRITICAL',
      important: '🟠 IMPORTANT',
      supporting: '🟡 SUPPORTING',
      minor: '⚪ MINOR'
    };
    return labels[significance] || '';
  }

  getEventColor(significance) {
    const colors = {
      critical: '#FF0000',
      important: '#FF8800',
      supporting: '#FFDD00',
      minor: '#CCCCCC'
    };
    return colors[significance] || '#CCCCCC';
  }

  getPatternColor(patternType) {
    const colors = {
      delay_pattern: '#FF6B6B',
      retaliation_pattern: '#FF0000',
      escalation_pattern: '#FF8800',
      bad_faith: '#CC0000',
      repeated_failures: '#FF4444',
      systematic_neglect: '#990000'
    };
    return colors[patternType] || '#888888';
  }
}
