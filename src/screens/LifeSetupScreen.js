import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LifeSetupScreen = ({ navigation }) => {
  const lifeSetupGuides = [
    {
      id: 'ssn',
      title: 'Social Security Number',
      icon: '🆔',
      color: '#4CAF50',
      description: 'Essential ID for work and benefits',
      guides: [
        {
          title: 'Who Can Apply',
          content: [
            'Work visa holders with employment authorization',
            'Green card holders',
            'Certain student visa holders with job offers',
            'Asylees and refugees',
          ],
        },
        {
          title: 'How to Apply',
          content: [
            'Visit local Social Security office',
            'Bring passport, visa, I-94, and work authorization',
            'Complete SS-5 application form',
            'Processing takes 2-4 weeks',
            'Card arrives by mail',
          ],
        },
        {
          title: 'Required Documents',
          content: [
            'Valid passport',
            'Immigration documents (visa, I-94)',
            'Work authorization (EAD card or visa)',
            'Birth certificate if available',
          ],
        },
      ],
    },
    {
      id: 'banking',
      title: 'Banking Without History',
      icon: '🏦',
      color: '#2196F3',
      description: 'Open accounts without credit history',
      guides: [
        {
          title: 'Immigrant-Friendly Banks',
          content: [
            'Chase Bank - Offers secured cards',
            'Bank of America - SafeBalance accounts',
            'Wells Fargo - Opportunity Checking',
            'Capital One - No-fee checking',
            'Local credit unions - Often more flexible',
          ],
        },
        {
          title: 'What You Need',
          content: [
            'Passport and visa',
            'Proof of address (lease, utility bill)',
            'Initial deposit ($25-100)',
            'SSN or ITIN (some banks accept passport only)',
            'Employment letter (helpful but not always required)',
          ],
        },
        {
          title: 'Account Types',
          content: [
            'Checking Account - For daily transactions',
            'Savings Account - Build emergency fund',
            'Secured Credit Card - Start building credit',
            'Money Market - Higher interest savings',
          ],
        },
      ],
    },
    {
      id: 'credit',
      title: 'Building Credit Fast',
      icon: '💳',
      color: '#FF9800',
      description: 'Establish credit score from zero',
      guides: [
        {
          title: '6-Month Credit Plan',
          content: [
            'Month 1: Get secured credit card ($200-500 deposit)',
            'Month 2: Set up automatic small payment',
            'Month 3: Keep utilization under 30%',
            'Month 4: Consider becoming authorized user',
            'Month 5: Apply for second secured card',
            'Month 6: Check credit score - should be 650+',
          ],
        },
        {
          title: 'Best Secured Cards',
          content: [
            'Discover it® Secured - Cashback rewards',
            'Capital One Secured - Low deposit',
            'OpenSky® Secured - No credit check',
            'Citi® Secured Mastercard® - Path to unsecured',
          ],
        },
        {
          title: 'Credit Building Tips',
          content: [
            'Never miss a payment (35% of score)',
            'Keep balances low (30% of score)',
            'Don\'t close old accounts',
            'Mix credit types over time',
            'Check free credit report annually',
          ],
        },
      ],
    },
    {
      id: 'job',
      title: 'First Job Search',
      icon: '💼',
      color: '#9C27B0',
      description: 'Find work with foreign credentials',
      guides: [
        {
          title: 'Work Authorization',
          content: [
            'H-1B, L-1, O-1 - Tied to specific employer',
            'EAD Card - Open work authorization',
            'F-1 OPT - For recent graduates',
            'Green Card - Unrestricted work',
            'Check visa restrictions carefully',
          ],
        },
        {
          title: 'Job Search Platforms',
          content: [
            'LinkedIn - Professional networking',
            'Indeed - Largest job board',
            'Glassdoor - Company reviews',
            'AngelList - Startup jobs',
            'H1BGrader - H-1B friendly employers',
            'MyVisaJobs - Immigration-friendly companies',
          ],
        },
        {
          title: 'Resume Tips',
          content: [
            'Use U.S. format (no photo, age, or personal info)',
            'Highlight transferable skills',
            'Get credentials evaluated if needed',
            'Include visa status (e.g., "Authorized to work")',
            'Quantify achievements with numbers',
            'Keep to 1-2 pages maximum',
          ],
        },
      ],
    },
  ];

  const handleGuidePress = (guide) => {
    navigation.navigate('GuideDetail', { guide });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Life Setup Guide</Text>
          <Text style={styles.subtitle}>Essential steps for your new life in America</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>📍 Your First 30 Days</Text>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineNumber}>1</Text>
            <Text style={styles.timelineText}>Apply for SSN (if eligible)</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineNumber}>2</Text>
            <Text style={styles.timelineText}>Open bank account</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineNumber}>3</Text>
            <Text style={styles.timelineText}>Get secured credit card</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineNumber}>4</Text>
            <Text style={styles.timelineText}>Set up phone & utilities</Text>
          </View>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineNumber}>5</Text>
            <Text style={styles.timelineText}>Start job applications</Text>
          </View>
        </View>

        <View style={styles.guidesContainer}>
          {lifeSetupGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={[styles.guideCard, { borderLeftColor: guide.color }]}
              onPress={() => handleGuidePress(guide)}
            >
              <View style={styles.guideHeader}>
                <Text style={styles.guideIcon}>{guide.icon}</Text>
                <View style={styles.guideInfo}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <Text style={styles.guideDescription}>{guide.description}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
              
              <View style={styles.guidePreview}>
                {guide.guides[0].content.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Text style={styles.previewBullet}>•</Text>
                    <Text style={styles.previewText}>{item}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>📚 Additional Resources</Text>
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => handleGuidePress({
              id: "itin",
              title: "IRS ITIN Application",
              icon: "📄",
              color: "#4CAF50",
              description: "Individual Taxpayer Identification Number",
              guides: [
                {
                  title: "What is an ITIN?",
                  content: [
                    "Tax processing number for those who can't get an SSN",
                    "Required to file taxes if you earn income",
                    "Does NOT provide work authorization",
                    "Format: 9XX-XX-XXXX",
                  ],
                },
                {
                  title: "How to Apply",
                  content: [
                    "Complete Form W-7 with IRS",
                    "Include federal tax return with application",
                    "Provide original passport or certified copies",
                    "Apply by mail, in person, or through Certifying Acceptance Agent",
                    "Processing takes 7-11 weeks",
                  ],
                },
              ],
            })}
          >
            <Text style={styles.resourceName}>IRS ITIN Application</Text>
            <Text style={styles.resourceDescription}>If you can't get SSN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => handleGuidePress({
              id: "dmv",
              title: "DMV License Guide",
              icon: "🚗",
              color: "#2196F3",
              description: "Getting a driver's license as an immigrant",
              guides: [
                {
                  title: "General Requirements",
                  content: [
                    "Valid immigration status (requirements vary by state)",
                    "Proof of identity (passport, visa, I-94)",
                    "Proof of residency (lease, utility bill)",
                    "SSN or proof of ineligibility",
                    "Pass written test, vision test, and road test",
                  ],
                },
                {
                  title: "States with Immigrant-Friendly Policies",
                  content: [
                    "19 states + DC allow licenses regardless of status",
                    "California, New York, Illinois, New Jersey among them",
                    "Some states issue 'standard' vs 'REAL ID' licenses",
                    "REAL ID required for domestic flights starting May 2025",
                    "Check your state's DMV website for specific requirements",
                  ],
                },
              ],
            })}
          >
            <Text style={styles.resourceName}>DMV License Guide</Text>
            <Text style={styles.resourceDescription}>State-by-state requirements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resourceItem}
            onPress={() => handleGuidePress({
              id: "healthcare",
              title: "Healthcare Options",
              icon: "🏥",
              color: "#FF9800",
              description: "Health insurance for immigrants",
              guides: [
                {
                  title: "Insurance Options",
                  content: [
                    "Employer-sponsored insurance (most common for work visa holders)",
                    "ACA Marketplace plans (Healthcare.gov) — available to lawful residents",
                    "Medicaid — varies by state and immigration status",
                    "University health plans — required for most F-1 students",
                    "Short-term health insurance — temporary coverage",
                  ],
                },
                {
                  title: "Important Notes",
                  content: [
                    "Most visa holders are NOT eligible for Medicaid initially",
                    "F-1 students typically must enroll in school health plan",
                    "H-1B holders usually get employer insurance",
                    "Emergency Medicaid available regardless of status",
                    "Community health centers offer sliding-scale fees",
                  ],
                },
              ],
            })}
          >
            <Text style={styles.resourceName}>Healthcare Options</Text>
            <Text style={styles.resourceDescription}>Insurance for immigrants</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Avoid Scams</Text>
            <Text style={styles.warningText}>
              Never pay for job offers, SSN applications are free, and only use 
              official government websites.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  timelineCard: {
    backgroundColor: '#E8F4F8',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E86AB',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 15,
  },
  timelineText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  guidesContainer: {
    paddingHorizontal: 20,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  guideIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  guideDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  guidePreview: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  previewItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  previewBullet: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  previewText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  resourcesCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  resourceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#666666',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default LifeSetupScreen;
