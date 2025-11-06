const crypto = require('crypto');

class CertificateCelebrationSystem {
  constructor(generator, validation, social) {
    this.generator = generator;
    this.validation = validation;
    this.social = social;
    this.celebrations = new Map();
    this.rewards = new Map();
    this.leaderboards = new Map();
  }

  async initialize() {
    // Setup celebration templates
    await this.loadCelebrationTemplates();

    // Initialize rewards system
    await this.setupRewardsSystem();

    // Setup leaderboards
    await this.initializeLeaderboards();

    console.log('Certificate Celebration System initialized');
  }

  async loadCelebrationTemplates() {
    this.celebrationTemplates = {
      genesis: {
        title: '🎉 Genesis Validator!',
        message: 'You helped launch Digital Giant L1! You are a founding member of this revolutionary blockchain.',
        badge: 'genesis-founder',
        rewards: ['genesis-nft', 'voting-power-boost', 'early-adopter-status'],
        socialActions: ['tweet', 'discord-announce', 'telegram-notify'],
        visualEffects: ['fireworks', 'golden-glow', 'particle-explosion']
      },

      'first-transaction': {
        title: '🚀 First Transaction Pioneer!',
        message: 'You made the first transaction on Digital Giant L1! You are a trailblazer in blockchain history.',
        badge: 'pioneer',
        rewards: ['first-tx-nft', 'pioneer-status', 'transaction-fee-discount'],
        socialActions: ['tweet', 'story-share', 'achievement-post'],
        visualEffects: ['rocket-launch', 'star-explosion', 'trail-effect']
      },

      mint: {
        title: '🎨 Token Creator!',
        message: 'You minted your first token on Digital Giant L1! Welcome to the creator economy.',
        badge: 'creator',
        rewards: ['creator-nft', 'minting-fee-discount', 'marketplace-priority'],
        socialActions: ['tweet', 'discord-share', 'portfolio-update'],
        visualEffects: ['color-burst', 'creation-sparkles', 'growth-animation']
      },

      milestone: {
        title: '⭐ Milestone Achiever!',
        message: 'You reached a significant milestone on Digital Giant L1! Your dedication is celebrated.',
        badge: 'achiever',
        rewards: ['milestone-nft', 'loyalty-points', 'exclusive-access'],
        socialActions: ['tweet', 'achievement-share', 'leaderboard-update'],
        visualEffects: ['trophy-shine', 'progress-bars', 'celebration-banners']
      },

      'volume-milestone': {
        title: '💰 Volume Champion!',
        message: 'You achieved incredible transaction volume! You are a power user of Digital Giant L1.',
        badge: 'champion',
        rewards: ['champion-nft', 'volume-bonus', 'premium-features'],
        socialActions: ['tweet', 'volume-showcase', 'champion-announcement'],
        visualEffects: ['gold-rain', 'volume-charts', 'champion-crown']
      },

      'holder-milestone': {
        title: '💎 Long-term Holder!',
        message: 'Your long-term holding is celebrated! You believe in the future of Digital Giant L1.',
        badge: 'diamond-hand',
        rewards: ['holder-nft', 'staking-bonus', 'governance-voting'],
        socialActions: ['tweet', 'holding-story', 'community-recognition'],
        visualEffects: ['diamond-shine', 'time-lapse', 'trust-indicators']
      }
    };
  }

  async setupRewardsSystem() {
    this.rewardTemplates = {
      'genesis-nft': {
        type: 'nft',
        name: 'Genesis Validator NFT',
        description: 'Exclusive NFT for genesis validators',
        rarity: 'legendary',
        benefits: ['voting_power_2x', 'fee_discount_50%', 'exclusive_events']
      },

      'first-tx-nft': {
        type: 'nft',
        name: 'First Transaction Pioneer NFT',
        description: 'NFT celebrating the first transaction',
        rarity: 'epic',
        benefits: ['transaction_history', 'pioneer_badge', 'community_status']
      },

      'creator-nft': {
        type: 'nft',
        name: 'Token Creator NFT',
        description: 'NFT for token creators',
        rarity: 'rare',
        benefits: ['minting_discount', 'creator_tools', 'marketplace_boost']
      },

      'voting-power-boost': {
        type: 'governance',
        name: 'Voting Power Boost',
        description: '2x voting power in governance',
        duration: 'permanent',
        multiplier: 2
      },

      'fee-discount': {
        type: 'economic',
        name: 'Transaction Fee Discount',
        description: '50% discount on transaction fees',
        duration: '1_year',
        percentage: 50
      }
    };
  }

  async initializeLeaderboards() {
    this.leaderboards.set('genesis-validators', {
      name: 'Genesis Validators',
      criteria: 'genesis_participation',
      topParticipants: [],
      totalParticipants: 0
    });

    this.leaderboards.set('volume-champions', {
      name: 'Volume Champions',
      criteria: 'transaction_volume',
      topParticipants: [],
      totalParticipants: 0
    });

    this.leaderboards.set('creators', {
      name: 'Token Creators',
      criteria: 'tokens_created',
      topParticipants: [],
      totalParticipants: 0
    });
  }

  async triggerCelebration(recipient, eventType, certificate) {
    console.log(`Triggering celebration for ${recipient}: ${eventType}`);

    const template = this.celebrationTemplates[eventType];
    if (!template) {
      console.log(`No celebration template for ${eventType}`);
      return;
    }

    const celebration = {
      id: `celeb_${certificate.id}_${Date.now()}`,
      recipient,
      eventType,
      certificateId: certificate.id,
      template,
      timestamp: Date.now(),
      status: 'active'
    };

    // Store celebration
    this.celebrations.set(celebration.id, celebration);

    // Execute celebration components
    await this.executeCelebration(celebration);

    // Update leaderboards
    await this.updateLeaderboards(recipient, eventType, certificate);

    return celebration;
  }

  async executeCelebration(celebration) {
    const { recipient, template, certificateId } = celebration;

    try {
      // 1. Issue rewards
      await this.issueRewards(recipient, template.rewards, certificateId);

      // 2. Trigger social actions
      await this.triggerSocialActions(recipient, template.socialActions, celebration);

      // 3. Create visual celebration
      await this.createVisualCelebration(recipient, template.visualEffects, celebration);

      // 4. Send notifications
      await this.sendNotifications(recipient, template, celebration);

      // 5. Update user profile
      await this.updateUserProfile(recipient, template.badge, celebration);

      console.log(`Celebration executed for ${recipient}`);

    } catch (error) {
      console.error('Failed to execute celebration:', error);
      celebration.status = 'failed';
    }
  }

  async issueRewards(recipient, rewardIds, certificateId) {
    console.log(`Issuing rewards to ${recipient}: ${rewardIds.join(', ')}`);

    const issuedRewards = [];

    for (const rewardId of rewardIds) {
      const rewardTemplate = this.rewardTemplates[rewardId];
      if (!rewardTemplate) {
        console.warn(`Reward template not found: ${rewardId}`);
        continue;
      }

      const reward = {
        id: `reward_${recipient}_${rewardId}_${Date.now()}`,
        recipient,
        rewardId,
        template: rewardTemplate,
        certificateId,
        issuedAt: Date.now(),
        status: 'active',
        expiresAt: rewardTemplate.duration === 'permanent' ? null :
                  Date.now() + this.parseDuration(rewardTemplate.duration)
      };

      // Store reward
      this.rewards.set(reward.id, reward);
      issuedRewards.push(reward);

      // Execute reward-specific logic
      await this.executeReward(reward);
    }

    return issuedRewards;
  }

  parseDuration(duration) {
    const durationMap = {
      '1_year': 365 * 24 * 60 * 60 * 1000,
      '6_months': 180 * 24 * 60 * 60 * 1000,
      '1_month': 30 * 24 * 60 * 60 * 1000,
      'permanent': null
    };

    return durationMap[duration] || null;
  }

  async executeReward(reward) {
    const { template, recipient } = reward;

    switch (template.type) {
      case 'nft':
        await this.mintRewardNFT(recipient, template);
        break;
      case 'governance':
        await this.applyGovernanceBoost(recipient, template);
        break;
      case 'economic':
        await this.applyEconomicBenefit(recipient, template);
        break;
      default:
        console.log(`Unknown reward type: ${template.type}`);
    }
  }

  async mintRewardNFT(recipient, template) {
    // Mint NFT reward
    console.log(`Minting ${template.name} NFT for ${recipient}`);
    // Implementation would mint NFT on blockchain
  }

  async applyGovernanceBoost(recipient, template) {
    // Apply governance voting boost
    console.log(`Applying governance boost for ${recipient}`);
    // Implementation would update governance contract
  }

  async applyEconomicBenefit(recipient, template) {
    // Apply economic benefits like fee discounts
    console.log(`Applying economic benefit for ${recipient}`);
    // Implementation would update user benefits
  }

  async triggerSocialActions(recipient, actions, celebration) {
    for (const action of actions) {
      await this.executeSocialAction(recipient, action, celebration);
    }
  }

  async executeSocialAction(recipient, action, celebration) {
    switch (action) {
      case 'tweet':
        await this.postTweet(recipient, celebration);
        break;
      case 'discord-announce':
        await this.discordAnnouncement(recipient, celebration);
        break;
      case 'telegram-notify':
        await this.telegramNotification(recipient, celebration);
        break;
      case 'story-share':
        await this.storyShare(recipient, celebration);
        break;
      default:
        console.log(`Unknown social action: ${action}`);
    }
  }

  async postTweet(recipient, celebration) {
    const tweet = {
      text: `${celebration.template.title} ${celebration.template.message}`,
      image: celebration.certificateImage,
      hashtags: ['DigitalGiantL1', 'Blockchain', 'Achievement'],
      timestamp: Date.now()
    };

    console.log(`Posting tweet for ${recipient}: ${tweet.text}`);
    // Implementation would post to Twitter API
  }

  async discordAnnouncement(recipient, celebration) {
    const announcement = {
      channel: 'achievements',
      message: `🎉 **${celebration.template.title}**\n${recipient} ${celebration.template.message}`,
      embed: {
        title: celebration.template.title,
        description: celebration.template.message,
        image: celebration.certificateImage,
        color: 0x00ff00
      }
    };

    console.log(`Discord announcement for ${recipient}`);
    // Implementation would post to Discord
  }

  async telegramNotification(recipient, celebration) {
    const notification = {
      chat: recipient,
      message: `🎊 ${celebration.template.title}\n\n${celebration.template.message}`,
      image: celebration.certificateImage
    };

    console.log(`Telegram notification sent to ${recipient}`);
    // Implementation would send Telegram message
  }

  async storyShare(recipient, celebration) {
    // Share to social media stories
    console.log(`Story shared for ${recipient}`);
  }

  async createVisualCelebration(recipient, effects, celebration) {
    // Create visual celebration effects
    const visualCelebration = {
      recipient,
      effects,
      celebrationId: celebration.id,
      duration: 10000, // 10 seconds
      createdAt: Date.now()
    };

    console.log(`Visual celebration created for ${recipient}: ${effects.join(', ')}`);
    // Implementation would trigger frontend visual effects
  }

  async sendNotifications(recipient, template, celebration) {
    const notification = {
      recipient,
      title: template.title,
      message: template.message,
      type: 'celebration',
      celebrationId: celebration.id,
      timestamp: Date.now(),
      actions: ['view_certificate', 'share_achievement', 'claim_rewards']
    };

    console.log(`Notification sent to ${recipient}: ${template.title}`);
    // Implementation would send push notification, email, etc.
  }

  async updateUserProfile(recipient, badge, celebration) {
    // Update user profile with new badge and achievements
    console.log(`User profile updated for ${recipient}: +${badge} badge`);
    // Implementation would update user profile in database
  }

  async updateLeaderboards(recipient, eventType, certificate) {
    // Update relevant leaderboards
    const leaderboardUpdates = this.getLeaderboardUpdates(eventType);

    for (const leaderboardId of leaderboardUpdates) {
      await this.updateLeaderboard(leaderboardId, recipient, certificate);
    }
  }

  getLeaderboardUpdates(eventType) {
    const updates = {
      genesis: ['genesis-validators'],
      mint: ['creators'],
      'volume-milestone': ['volume-champions'],
      'first-transaction': ['genesis-validators']
    };

    return updates[eventType] || [];
  }

  async updateLeaderboard(leaderboardId, recipient, certificate) {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) return;

    // Add or update participant
    const existingIndex = leaderboard.topParticipants.findIndex(p => p.address === recipient);

    const participant = {
      address: recipient,
      certificateId: certificate.id,
      score: this.calculateLeaderboardScore(leaderboardId, certificate),
      timestamp: certificate.timestamp
    };

    if (existingIndex >= 0) {
      leaderboard.topParticipants[existingIndex] = participant;
    } else {
      leaderboard.topParticipants.push(participant);
      leaderboard.totalParticipants++;
    }

    // Sort leaderboard
    leaderboard.topParticipants.sort((a, b) => b.score - a.score);

    // Keep only top 100
    if (leaderboard.topParticipants.length > 100) {
      leaderboard.topParticipants = leaderboard.topParticipants.slice(0, 100);
    }

    console.log(`Leaderboard updated: ${leaderboardId} - ${recipient} score: ${participant.score}`);
  }

  calculateLeaderboardScore(leaderboardId, certificate) {
    // Calculate score based on leaderboard criteria
    switch (leaderboardId) {
      case 'genesis-validators':
        return certificate.blockNumber === 1 ? 1000 : 100;
      case 'volume-champions':
        return certificate.metadata?.attributes?.find(a => a.trait_type === 'Amount')?.value || 0;
      case 'creators':
        return 1; // Each certificate counts
      default:
        return 1;
    }
  }

  async getCelebrationStats() {
    const stats = {
      totalCelebrations: this.celebrations.size,
      activeCelebrations: 0,
      totalRewards: this.rewards.size,
      leaderboardStats: {}
    };

    for (const celebration of this.celebrations.values()) {
      if (celebration.status === 'active') {
        stats.activeCelebrations++;
      }
    }

    for (const [id, leaderboard] of this.leaderboards) {
      stats.leaderboardStats[id] = {
        name: leaderboard.name,
        participants: leaderboard.totalParticipants,
        topScore: leaderboard.topParticipants[0]?.score || 0
      };
    }

    return stats;
  }

  async getUserCelebrations(address) {
    const userCelebrations = [];

    for (const celebration of this.celebrations.values()) {
      if (celebration.recipient === address) {
        userCelebrations.push(celebration);
      }
    }

    return userCelebrations;
  }

  async getUserRewards(address) {
    const userRewards = [];

    for (const reward of this.rewards.values()) {
      if (reward.recipient === address) {
        userRewards.push(reward);
      }
    }

    return userRewards;
  }

  async getLeaderboard(leaderboardId, limit = 50) {
    const leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) {
      throw new Error(`Leaderboard not found: ${leaderboardId}`);
    }

    return {
      id: leaderboardId,
      name: leaderboard.name,
      criteria: leaderboard.criteria,
      participants: leaderboard.topParticipants.slice(0, limit),
      totalParticipants: leaderboard.totalParticipants
    };
  }

  async createCustomCelebration(recipient, customTemplate) {
    const celebration = {
      id: `custom_${recipient}_${Date.now()}`,
      recipient,
      eventType: 'custom',
      template: customTemplate,
      timestamp: Date.now(),
      status: 'active'
    };

    this.celebrations.set(celebration.id, celebration);
    await this.executeCelebration(celebration);

    return celebration;
  }

  async extendCelebration(celebrationId, extension) {
    const celebration = this.celebrations.get(celebrationId);
    if (!celebration) {
      throw new Error(`Celebration not found: ${celebrationId}`);
    }

    // Extend celebration duration or add new effects
    Object.assign(celebration, extension);
    celebration.extendedAt = Date.now();

    console.log(`Celebration extended: ${celebrationId}`);
    return celebration;
  }

  async archiveOldCelebrations(olderThan = 30 * 24 * 60 * 60 * 1000) { // 30 days
    const cutoff = Date.now() - olderThan;
    let archived = 0;

    for (const [id, celebration] of this.celebrations) {
      if (celebration.timestamp < cutoff && celebration.status === 'completed') {
        celebration.status = 'archived';
        archived++;
      }
    }

    console.log(`Archived ${archived} old celebrations`);
    return archived;
  }

  async generateCelebrationReport(fromDate, toDate) {
    const report = {
      period: { fromDate, toDate },
      celebrations: [],
      rewards: [],
      leaderboards: {}
    };

    // Filter celebrations by date
    for (const celebration of this.celebrations.values()) {
      if (celebration.timestamp >= fromDate && celebration.timestamp <= toDate) {
        report.celebrations.push(celebration);
      }
    }

    // Filter rewards by date
    for (const reward of this.rewards.values()) {
      if (reward.issuedAt >= fromDate && reward.issuedAt <= toDate) {
        report.rewards.push(reward);
      }
    }

    // Include leaderboard snapshots
    for (const [id, leaderboard] of this.leaderboards) {
      report.leaderboards[id] = {
        name: leaderboard.name,
        topParticipants: leaderboard.topParticipants.slice(0, 10),
        totalParticipants: leaderboard.totalParticipants,
        snapshotDate: Date.now()
      };
    }

    return report;
  }
}

module.exports = CertificateCelebrationSystem;
