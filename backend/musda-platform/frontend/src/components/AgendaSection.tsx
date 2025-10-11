import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, Mic, Coffee, Award, BookOpen, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { apiCall } from '../config/api';

type AgendaItem = {
  id: number;
  title: string;
  description: string;
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
  date: string;      // YYYY-MM-DD
  location: string;
  speaker: string;
  status?: string;
  category?: string;
  // legacy fields (snake_case) possibly coming from older API versions
  start_time?: string;
  end_time?: string;
  agenda_date?: string;
};

const categoryIcon: Record<string, any> = {
  ceremony: Home,
  speech: Users,
  presentation: BookOpen,
  workshop: Mic,
  discussion: Users,
  break: Coffee,
  awarding: Award
};

const categoryColor: Record<string, string> = {
  ceremony: 'from-yellow-500 to-yellow-600',
  speech: 'from-yellow-400 to-yellow-500',
  presentation: 'from-yellow-500 to-yellow-600',
  workshop: 'from-yellow-600 to-yellow-700',
  discussion: 'from-yellow-400 to-yellow-500',
  break: 'from-yellow-600 to-yellow-700',
  awarding: 'from-yellow-400 to-yellow-500'
};

/**
 * Parse date string (any common DB format) and time string (HH:MM or HH:MM:SS)
 * and return a Date object using numeric constructor to avoid cross-browser parse issues.
 */
function parseDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;

  // extract YYYY-MM-DD
  const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;
  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);

  // extract HH:MM(:SS)?
  let hour = 0, minute = 0, second = 0;
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      second = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    }
  }

  // create date in local timezone (safe)
  return new Date(year, month - 1, day, hour, minute, second);
}

// Formatter jadi: "15 Oktober | 09.00 - 14.00"
function formatAgendaDate(date?: string, start?: string, end?: string) {
  // Validasi input
  if (!date) return 'Tanggal belum ditentukan';
  
  const startObj = parseDateTime(date, start);
  const endObj = parseDateTime(date, end);

  // fallback jika parsing gagal: tampilkan mentah supaya tidak show "Invalid Date"
  const formattedDate = (() => {
    if (!date || typeof date !== 'string') return 'Tanggal tidak tersedia';
    const m = date.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return date;
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  })();

  const formattedStart = startObj
    ? startObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
    : (start || '--');

  const formattedEnd = endObj
    ? endObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
    : (end || '--');

  return `${formattedDate} | ${formattedStart} - ${formattedEnd}`;
}

export function AgendaSection() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Data default jika API gagal
  const defaultAgendaItems: AgendaItem[] = [
    {
      id: 1,
      title: 'Pembukaan MUSDA II',
      description: 'Acara pembukaan resmi Musyawarah Daerah II HIMPERRA Provinsi Lampung',
      startTime: '09:00:00',
      endTime: '10:00:00',
      date: '2025-12-31',
      location: 'Auditorium Utama',
      speaker: 'Ketua HIMPERRA Pusat',
      status: 'scheduled',
      category: 'ceremony'
    },
    {
      id: 2,
      title: 'Keynote Speech',
      description: 'Presentasi utama mengenai visi dan misi HIMPERRA ke depan',
      startTime: '10:30:00',
      endTime: '12:00:00',
      date: '2025-12-31',
      location: 'Auditorium Utama',
      speaker: 'Prof. Dr. Ahmad Reza',
      status: 'scheduled',
      category: 'presentation'
    },
    {
      id: 3,
      title: 'Workshop Kepemimpinan',
      description: 'Workshop interaktif tentang kepemimpinan organisasi',
      startTime: '13:00:00',
      endTime: '15:00:00',
      date: '2025-12-31',
      location: 'Ruang Workshop A',
      speaker: 'Dr. Siti Nurhaliza',
      status: 'scheduled',
      category: 'workshop'
    }
  ];

  useEffect(() => {
    const fetchAgendas = async () => {
      setLoading(true);
      try {
        const data = await apiCall('/agendas');
        const normalized: AgendaItem[] = Array.isArray(data) ? data.map((a: any) => ({
          id: a.id,
            title: a.title,
            description: a.description || '',
            startTime: a.startTime || a.start_time || '',
            endTime: a.endTime || a.end_time || '',
            date: (a.date || a.agenda_date || '').match(/\d{4}-\d{2}-\d{2}/)?.[0] || (a.date || a.agenda_date || ''),
            location: a.location || '',
            speaker: a.speaker || '',
            status: a.status || 'scheduled',
            category: a.category || 'ceremony'
        })) : defaultAgendaItems;
        setAgendaItems(normalized);
      } catch (err) {
        console.log('API not available, using default agenda data');
        setAgendaItems(defaultAgendaItems);
      }
      setLoading(false);
    };
    fetchAgendas();
  }, []);

  return (
    <section id="agenda" className="py-16 sm:py-24 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden px-4">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-yellow-100">
            Agenda <span className="text-yellow-500">MUSDA II</span>
          </h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 transform -translate-x-1/2 shadow-lg" />

          <div className="space-y-20 sm:space-y-28">
            {loading ? (
              <div className="text-center text-yellow-400">Memuat agenda...</div>
            ) : agendaItems.length === 0 ? (
              <div className="text-center text-gray-400">Belum ada agenda tersedia.</div>
            ) : (
              agendaItems.map((item, index) => {
                const isLeft = index % 2 === 0;
                const catKey = (item.category || 'ceremony') as string;
                const Icon = categoryIcon[catKey] || Home;
                const color = categoryColor[catKey] || 'from-yellow-500 to-yellow-600';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative flex w-full ${isLeft ? 'justify-start pr-6 md:pr-16' : 'justify-end pl-6 md:pl-16'}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3 }}
                      className={`absolute left-1/2 w-6 h-6 bg-gradient-to-r ${color} transform -translate-x-1/2 z-20 shadow-2xl`}
                      style={{
                        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                      }}
                    />

                    <div className="w-full md:w-5/12">
                      <Card className="bg-gray-900/80 border-yellow-500/40 backdrop-blur-lg hover:bg-gray-800/80 hover:border-yellow-400/70 transition-all duration-500 shadow-2xl">
                        <CardContent className="p-10">
                          <div className="flex items-start gap-6">
                            <div
                              className={`w-16 h-16 bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 shadow-2xl`}
                              style={{
                                clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
                              }}
                            >
                              <Icon className="text-gray-900" size={28} />
                            </div>
                            <div className="flex-1">
                              <span className="text-yellow-400 font-bold text-lg">
                                {formatAgendaDate(item.date, item.startTime, item.endTime)}
                              </span>
                              <h3 className="text-yellow-100 font-bold text-xl mb-3">{item.title}</h3>
                              <p className="text-gray-300 leading-relaxed">{item.description}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{item.location}</div>
                                {item.speaker && item.speaker !== '-' && (
                                  <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{item.speaker}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
