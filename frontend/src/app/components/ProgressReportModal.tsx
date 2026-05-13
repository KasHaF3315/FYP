import { X, Download, Shield, Star, Trophy, Clock, CheckCircle, TrendingUp, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProgressReportModalProps {
  onClose: () => void;
  data: ProgressReportData;
}

export interface ProgressReportData {
  childName: string;
  childAge: number;
  completedLevels: number[];
  totalScore: number;
  accuracy: number;
  gamesPlayed: GameProgress[];
  totalTimeSpent: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  reportDate: string;
}

interface GameProgress {
  gameName: string;
  levels: LevelProgress[];
  totalLevels: number;
  completed: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface LevelProgress {
  level: number;
  title: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: string;
}

export function ProgressReportModal({ onClose, data }: ProgressReportModalProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Title with blue background effect
    doc.setFillColor(45, 90, 138);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('CYBERQUEST PROGRESS REPORT', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated on ${new Date(data.reportDate).toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });

    yPos = 45;

    // === CHILD INFO SECTION ===
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(45, 90, 138);
    doc.text(data.childName, 20, yPos + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Age: ${data.childAge} years old`, 20, yPos + 17);

    // Stats in boxes
    const statBoxWidth = (pageWidth - 50) / 4;
    const statBoxY = yPos + 23;
    
    // Levels Done
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, statBoxY, statBoxWidth - 3, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text(String(data.completedLevels.length), 20 + (statBoxWidth - 3) / 2, statBoxY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Levels Done', 20 + (statBoxWidth - 3) / 2, statBoxY + 9, { align: 'center' });

    // Total Score
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20 + statBoxWidth, statBoxY, statBoxWidth - 3, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text(String(data.totalScore), 20 + statBoxWidth + (statBoxWidth - 3) / 2, statBoxY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Score', 20 + statBoxWidth + (statBoxWidth - 3) / 2, statBoxY + 9, { align: 'center' });

    // Accuracy
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20 + statBoxWidth * 2, statBoxY, statBoxWidth - 3, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text(`${data.accuracy}%`, 20 + statBoxWidth * 2 + (statBoxWidth - 3) / 2, statBoxY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Accuracy', 20 + statBoxWidth * 2 + (statBoxWidth - 3) / 2, statBoxY + 9, { align: 'center' });

    // Time Spent
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20 + statBoxWidth * 3, statBoxY, statBoxWidth - 3, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text(String(data.totalTimeSpent), 20 + statBoxWidth * 3 + (statBoxWidth - 3) / 2, statBoxY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Minutes', 20 + statBoxWidth * 3 + (statBoxWidth - 3) / 2, statBoxY + 9, { align: 'center' });

    yPos = statBoxY + 20;

    // === GAME PROGRESS SECTION ===
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text('🛡️ Game Progress', 20, yPos);
    yPos += 7;

    data.gamesPlayed.forEach((game) => {
      // Game card
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPos, pageWidth - 30, 10 + (game.levels.length * 7), 2, 2, 'S');

      // Game name and status
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(game.gameName, 20, yPos + 5);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`${game.completed}/${game.totalLevels} levels completed`, 20, yPos + 9);

      // Status badge
      const statusText = game.status === 'completed' ? 'Completed' : game.status === 'in-progress' ? 'In Progress' : 'Not Started';
      const statusColor = game.status === 'completed' ? [34, 197, 94] : game.status === 'in-progress' ? [59, 130, 246] : [156, 163, 175];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - 50, yPos + 2, 33, 6, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(statusText, pageWidth - 33, yPos + 6, { align: 'center' });

      // Progress bar
      yPos += 12;
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(20, yPos, pageWidth - 40, 3, 1.5, 1.5, 'F');
      const progressWidth = ((pageWidth - 40) * game.completed) / game.totalLevels;
      if (progressWidth > 0) {
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(20, yPos, progressWidth, 3, 1.5, 1.5, 'F');
      }
      yPos += 6;

      // Level details
      if (game.levels.length > 0) {
        game.levels.forEach((level) => {
          const levelBg = level.completed ? [240, 253, 244] : [249, 250, 251];
          doc.setFillColor(levelBg[0], levelBg[1], levelBg[2]);
          doc.roundedRect(20, yPos, pageWidth - 40, 6, 1, 1, 'F');

          // Checkmark or circle
          doc.setFontSize(8);
          doc.setTextColor(level.completed ? 34 : 200, level.completed ? 197 : 200, level.completed ? 94 : 200);
          doc.text(level.completed ? '✓' : '○', 22, yPos + 4);

          // Level name
          doc.setFontSize(8);
          doc.setTextColor(75, 85, 99);
          doc.text(`Level ${level.level}: ${level.title}`, 28, yPos + 4);

          // Stats
          doc.setFontSize(7);
          doc.setTextColor(107, 114, 128);
          doc.text(`Score: ${level.score}/100`, pageWidth - 85, yPos + 4);
          doc.text(`Attempts: ${level.attempts}`, pageWidth - 60, yPos + 4);
          doc.text(level.timeSpent, pageWidth - 35, yPos + 4);

          yPos += 7;
        });
      }

      yPos += 5;
    });

    // Check if we need a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // === KEY STRENGTHS SECTION ===
    yPos += 5;
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text('🏆 Key Strengths', 20, yPos);
    yPos += 5;

    doc.setFillColor(240, 253, 244);
    const strengthsHeight = data.strengths.length * 7 + 5;
    doc.roundedRect(15, yPos, pageWidth - 30, strengthsHeight, 2, 2, 'F');
    yPos += 5;

    data.strengths.forEach((strength) => {
      doc.setFontSize(8);
      doc.setTextColor(34, 197, 94);
      doc.text('✓', 20, yPos);
      doc.setTextColor(75, 85, 99);
      const lines = doc.splitTextToSize(strength, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 4.5;
    });

    yPos += 5;

    // === AREAS FOR GROWTH SECTION ===
    if (data.areasForImprovement.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 5;
      doc.setFontSize(12);
      doc.setTextColor(45, 90, 138);
      doc.text('📈 Areas for Growth', 20, yPos);
      yPos += 5;

      doc.setFillColor(255, 247, 237);
      const improvementHeight = data.areasForImprovement.length * 7 + 5;
      doc.roundedRect(15, yPos, pageWidth - 30, improvementHeight, 2, 2, 'F');
      yPos += 5;

      data.areasForImprovement.forEach((area) => {
        doc.setFontSize(8);
        doc.setTextColor(249, 115, 22);
        doc.text('↗', 20, yPos);
        doc.setTextColor(75, 85, 99);
        const lines = doc.splitTextToSize(area, pageWidth - 45);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 4.5;
      });

      yPos += 5;
    }

    // === RECOMMENDATIONS SECTION ===
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 5;
    doc.setFontSize(12);
    doc.setTextColor(45, 90, 138);
    doc.text('📅 Recommendations for Parents', 20, yPos);
    yPos += 5;

    doc.setFillColor(239, 246, 255);
    const recHeight = data.recommendations.length * 7 + 5;
    doc.roundedRect(15, yPos, pageWidth - 30, recHeight, 2, 2, 'F');
    yPos += 5;

    data.recommendations.forEach((rec, index) => {
      doc.setFontSize(8);
      doc.setTextColor(59, 130, 246);
      doc.text(`${index + 1}.`, 20, yPos);
      doc.setTextColor(75, 85, 99);
      const lines = doc.splitTextToSize(rec, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 4.5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Generated by CyberQuest - Teaching Kids Cybersecurity', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Download the PDF
    doc.save(`CyberQuest_Progress_Report_${data.childName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white p-4 sm:p-6 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">Progress Report</h2>
                <p className="text-white/80 text-xs sm:text-sm">Generated on {new Date(data.reportDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Download PDF Report"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Child Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">{data.childAge <= 10 ? '👧' : '🧒'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{data.childName}</h3>
                  <p className="text-gray-600">Age: {data.childAge} years old</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.completedLevels.length}</p>
                  <p className="text-xs text-gray-600">Levels Done</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.totalScore}</p>
                  <p className="text-xs text-gray-600">Total Score</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.accuracy}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{data.totalTimeSpent}</p>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
              </div>
            </div>

            {/* Game Progress */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Game Progress
              </h3>
              <div className="space-y-4">
                {data.gamesPlayed.map((game, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800">{game.gameName}</h4>
                        <p className="text-sm text-gray-600">{game.completed}/{game.totalLevels} levels completed</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(game.status)}`}>
                        {getStatusIcon(game.status)}
                        {game.status === 'completed' ? 'Completed' : game.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                          style={{ width: `${(game.completed / game.totalLevels) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Level Details */}
                    {game.levels.length > 0 && (
                      <div className="space-y-2">
                        {game.levels.map((level, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${level.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                              {level.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                Level {level.level}: {level.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>Score: {level.score}/100</span>
                              <span>Attempts: {level.attempts}</span>
                              <span>{level.timeSpent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Key Strengths
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {data.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas for Improvement */}
            {data.areasForImprovement.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Areas for Growth
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <ul className="space-y-2">
                    {data.areasForImprovement.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recommendations for Parents
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {data.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">{index + 1}.</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}