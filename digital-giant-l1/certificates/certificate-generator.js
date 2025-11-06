const crypto = require('crypto');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;

class CertificateGenerator {
  constructor(storage, validation, celebration) {
    this.storage = storage;
    this.validation = validation;
    this.celebration = celebration;
    this.certificates = new Map();
    this.templates = new Map();
  }

  async initialize() {
    await this.loadTemplates();
    console.log('Certificate Generator initialized');
  }

  async loadTemplates() {
    // Load certificate templates
    this.templates.set('genesis', {
      background: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#16213e',
      title: 'GENESIS CERTIFICATE',
      subtitle: 'Digital Giant L1 Network'
    });

    this.templates.set('mint', {
      background: '#0f3460',
      textColor: '#e94560',
      accentColor: '#16213e',
      title: 'MINT CERTIFICATE',
      subtitle: 'Token Creation Achievement'
    });

    this.templates.set('milestone', {
      background: '#1a1a2e',
      textColor: '#0f3460',
      accentColor: '#e94560',
      title: 'MILESTONE CERTIFICATE',
      subtitle: 'Achievement Unlocked'
    });
  }

  async generateCertificate(eventType, eventData) {
    console.log(`Generating ${eventType} certificate for ${eventData.recipient}`);

    const certificate = {
      id: this.generateCertificateId(eventType, eventData),
      type: eventType,
      recipient: eventData.recipient,
      issuer: 'Digital Giant L1',
      timestamp: Date.now(),
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      metadata: await this.generateMetadata(eventType, eventData),
      verification: await this.generateVerification(eventData),
      celebration: await this.generateCelebration(eventType, eventData)
    };

    // Generate visual certificate
    certificate.image = await this.generateCertificateImage(certificate);

    // Store certificate
    const storageResult = await this.storage.storeCertificate(certificate);

    // Register with validation engine
    await this.validation.registerCertificate(certificate.id, storageResult);

    // Trigger celebration
    await this.celebration.triggerCelebration(eventData.recipient, eventType, certificate);

    // Cache certificate
    this.certificates.set(certificate.id, certificate);

    console.log(`Certificate generated: ${certificate.id}`);
    return certificate;
  }

  generateCertificateId(eventType, eventData) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const recipientHash = crypto.createHash('sha256')
      .update(eventData.recipient)
      .digest('hex')
      .substring(0, 8);

    return `cert_${eventType}_${timestamp}_${recipientHash}_${random}`;
  }

  async generateMetadata(eventType, eventData) {
    const template = this.templates.get(eventType) || this.templates.get('milestone');

    const metadata = {
      title: this.generateTitle(eventType, eventData),
      description: this.generateDescription(eventType, eventData),
      image: '', // Will be set after image generation
      attributes: this.generateAttributes(eventType, eventData),
      properties: {
        eventType,
        network: 'Digital Giant L1',
        chainId: 2023,
        timestamp: Date.now(),
        blockNumber: eventData.blockNumber
      }
    };

    return metadata;
  }

  generateTitle(eventType, eventData) {
    const titles = {
      genesis: 'Genesis Validator Certificate',
      'genesis-validator': 'Genesis Validator Certificate',
      'genesis-founder': 'Genesis Founder Certificate',
      mint: 'Token Mint Certificate',
      'nft-mint': 'NFT Creation Certificate',
      'stablecoin-mint': 'Stablecoin Mint Certificate',
      'first-transaction': 'First Transaction Certificate',
      milestone: 'Achievement Milestone Certificate',
      'volume-milestone': 'Volume Milestone Certificate',
      'holder-milestone': 'Long-term Holder Certificate'
    };

    return titles[eventType] || 'Digital Giant L1 Certificate';
  }

  generateDescription(eventType, eventData) {
    const descriptions = {
      genesis: `Celebrating participation in the genesis of Digital Giant L1 blockchain network. Validator since block ${eventData.blockNumber}.`,
      mint: `Commemorating the creation of ${eventData.tokenAmount || 'tokens'} on Digital Giant L1.`,
      'first-transaction': 'Honoring the first transaction on Digital Giant L1 - the beginning of a journey.',
      milestone: `Recognizing ${eventData.achievement} achievement on Digital Giant L1.`
    };

    return descriptions[eventType] || `Special recognition for ${eventType} on Digital Giant L1 blockchain.`;
  }

  generateAttributes(eventType, eventData) {
    const attributes = [
      {
        trait_type: 'Certificate Type',
        value: eventType
      },
      {
        trait_type: 'Network',
        value: 'Digital Giant L1'
      },
      {
        trait_type: 'Chain ID',
        value: 2023
      }
    ];

    // Add event-specific attributes
    switch (eventType) {
      case 'genesis':
        attributes.push({
          trait_type: 'Validator Rank',
          value: eventData.rank || 'Genesis Validator'
        });
        if (eventData.stake) {
          attributes.push({
            trait_type: 'Initial Stake',
            value: eventData.stake
          });
        }
        break;

      case 'mint':
        if (eventData.tokenType) {
          attributes.push({
            trait_type: 'Token Type',
            value: eventData.tokenType
          });
        }
        if (eventData.tokenAmount) {
          attributes.push({
            trait_type: 'Amount Minted',
            value: eventData.tokenAmount
          });
        }
        break;

      case 'milestone':
        if (eventData.achievement) {
          attributes.push({
            trait_type: 'Achievement',
            value: eventData.achievement
          });
        }
        break;
    }

    return attributes;
  }

  async generateVerification(eventData) {
    // Generate quantum-resistant signature
    const dataToSign = JSON.stringify({
      recipient: eventData.recipient,
      timestamp: Date.now(),
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash
    });

    const signature = await this.generateQuantumSignature(dataToSign);
    const proof = await this.generateZKP(eventData);

    return {
      signature,
      algorithm: 'Dilithium',
      publicKey: await this.getQuantumPublicKey(),
      proof,
      timestamp: Date.now()
    };
  }

  async generateQuantumSignature(data) {
    // Simulate quantum-resistant signature (Dilithium)
    // In production, this would use actual PQC library
    const hash = crypto.createHash('sha3-512').update(data).digest();
    const signature = crypto.sign('SHA256', hash, 'quantum_private_key_placeholder');

    return signature.toString('hex');
  }

  async getQuantumPublicKey() {
    // Return quantum public key
    // In production, this would be the actual quantum public key
    return 'quantum_public_key_placeholder';
  }

  async generateZKP(eventData) {
    // Generate zero-knowledge proof
    // This would use a ZKP library like snarkjs or libsnark
    return {
      proof: 'zkp_proof_placeholder',
      publicInputs: [eventData.recipient, eventData.blockNumber.toString()],
      verificationKey: 'zkp_vk_placeholder'
    };
  }

  async generateCelebration(eventType, eventData) {
    const celebrations = {
      genesis: {
        badge: 'genesis-founder',
        rewards: ['genesis-nft', 'voting-power-boost', 'early-adopter-status'],
        socialMessage: `🏆 Genesis Validator! ${eventData.recipient} helped launch Digital Giant L1`
      },
      mint: {
        badge: 'creator',
        rewards: ['mint-nft', 'creator-status'],
        socialMessage: `🎨 Token Creator! ${eventData.recipient} minted on Digital Giant L1`
      },
      'first-transaction': {
        badge: 'pioneer',
        rewards: ['first-tx-nft', 'pioneer-status'],
        socialMessage: `🚀 First Transaction! ${eventData.recipient} made their first move on Digital Giant L1`
      },
      milestone: {
        badge: 'achiever',
        rewards: ['milestone-nft'],
        socialMessage: `⭐ Milestone Achieved! ${eventData.recipient} hit a major milestone on Digital Giant L1`
      }
    };

    return celebrations[eventType] || {
      badge: 'participant',
      rewards: ['participant-nft'],
      socialMessage: `✨ Achievement Unlocked! ${eventData.recipient} earned a certificate on Digital Giant L1`
    };
  }

  async generateCertificateImage(certificate) {
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');

    const template = this.templates.get(certificate.type) || this.templates.get('milestone');

    // Draw background
    ctx.fillStyle = template.background;
    ctx.fillRect(0, 0, 1200, 800);

    // Draw border
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 1160, 760);

    // Draw title
    ctx.fillStyle = template.textColor;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(template.title, 600, 100);

    // Draw subtitle
    ctx.font = '24px Arial';
    ctx.fillStyle = template.accentColor;
    ctx.fillText(template.subtitle, 600, 140);

    // Draw certificate content
    ctx.font = '36px Arial';
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    ctx.fillText('This certifies that', 600, 220);

    // Draw recipient address
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = template.accentColor;
    const address = certificate.recipient;
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    ctx.fillText(shortAddress, 600, 280);

    // Draw achievement
    ctx.font = '24px Arial';
    ctx.fillStyle = template.textColor;
    ctx.fillText(certificate.metadata.title, 600, 340);

    // Draw date
    const date = new Date(certificate.timestamp).toLocaleDateString();
    ctx.font = '18px Arial';
    ctx.fillText(`Awarded on ${date}`, 600, 400);

    // Draw certificate ID
    ctx.font = '14px monospace';
    ctx.fillStyle = template.accentColor;
    ctx.fillText(`Certificate ID: ${certificate.id}`, 600, 450);

    // Draw blockchain info
    ctx.font = '14px Arial';
    ctx.fillStyle = template.textColor;
    ctx.fillText(`Block: ${certificate.blockNumber}`, 200, 500);
    ctx.fillText(`Network: Digital Giant L1`, 600, 500);
    ctx.fillText(`Chain ID: 2023`, 1000, 500);

    // Draw decorative elements
    this.drawDecorativeElements(ctx, template);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');

    // Store image in IPFS
    const imageResult = await this.storage.storeImage(buffer, certificate.id);

    return imageResult.url;
  }

  drawDecorativeElements(ctx, template) {
    // Draw some decorative elements
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = 2;

    // Left decoration
    ctx.beginPath();
    ctx.moveTo(100, 600);
    ctx.lineTo(150, 650);
    ctx.lineTo(100, 700);
    ctx.stroke();

    // Right decoration
    ctx.beginPath();
    ctx.moveTo(1100, 600);
    ctx.lineTo(1050, 650);
    ctx.lineTo(1100, 700);
    ctx.stroke();

    // Bottom text
    ctx.font = '16px Arial';
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    ctx.fillText('Digital Giant L1 - Celebrating Blockchain Achievements', 600, 750);
  }

  async getCertificate(certId) {
    return this.certificates.get(certId) ||
           await this.storage.retrieveCertificate(certId);
  }

  async getUserCertificates(address) {
    // Get all certificates for a user
    const certificates = [];
    for (const [id, cert] of this.certificates) {
      if (cert.recipient.toLowerCase() === address.toLowerCase()) {
        certificates.push(cert);
      }
    }

    // Also check storage for any missing ones
    const storedCerts = await this.storage.getUserCertificates(address);
    certificates.push(...storedCerts);

    return certificates;
  }

  async verifyCertificate(certId) {
    const certificate = await this.getCertificate(certId);
    if (!certificate) {
      return { valid: false, error: 'Certificate not found' };
    }

    // Verify signature
    const signatureValid = await this.validation.verifySignature(certificate);

    // Verify on-chain data
    const blockchainValid = await this.validation.verifyBlockchainData(certificate);

    // Verify storage integrity
    const storageValid = await this.storage.verifyCertificateIntegrity(certificate);

    return {
      valid: signatureValid && blockchainValid && storageValid,
      signatureValid,
      blockchainValid,
      storageValid
    };
  }

  async generateBulkCertificates(events) {
    const certificates = [];

    for (const event of events) {
      try {
        const certificate = await this.generateCertificate(event.type, event.data);
        certificates.push(certificate);
      } catch (error) {
        console.error(`Failed to generate certificate for event:`, event, error);
      }
    }

    return certificates;
  }

  // Special certificate types
  async generateGenesisCertificates() {
    const genesisEvents = [
      {
        type: 'genesis',
        data: {
          recipient: '0x0000000000000000000000000000000000000001',
          blockNumber: 1,
          rank: 'Genesis Validator #1',
          stake: '1000000 DG'
        }
      },
      {
        type: 'genesis',
        data: {
          recipient: '0x0000000000000000000000000000000000000002',
          blockNumber: 1,
          rank: 'Genesis Validator #2',
          stake: '1000000 DG'
        }
      }
    ];

    return await this.generateBulkCertificates(genesisEvents);
  }

  async generateMintCertificateBatch(mintEvents) {
    const events = mintEvents.map(event => ({
      type: 'mint',
      data: {
        recipient: event.minter,
        blockNumber: event.blockNumber,
        transactionHash: event.txHash,
        tokenType: event.tokenType,
        tokenAmount: event.amount
      }
    }));

    return await this.generateBulkCertificates(events);
  }

  async generateMilestoneCertificates(milestones) {
    const events = milestones.map(milestone => ({
      type: 'milestone',
      data: {
        recipient: milestone.address,
        blockNumber: milestone.blockNumber,
        achievement: milestone.achievement,
        value: milestone.value
      }
    }));

    return await this.generateBulkCertificates(events);
  }
}

module.exports = CertificateGenerator;
