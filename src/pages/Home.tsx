import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Star,
  Users,
  Heart,
  Calendar,
  Brain,
  Wind,
  Baby,
  Zap,
  Bone,
  Search,
  MapPin,
  ClipboardCheck,
  UserCheck,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn, resolveStorageUrl } from '../lib/utils';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PhysioHighlight from '../components/PhysioHighlight';

interface Professional {
  id: string;
  name: string;
  spec: string;
  fullSpec: string;
  img: string;
  rating: number;
  reviews: number;
  bio: string;
  location: string;
}

export default function Home() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [nameQuery, setNameQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todos');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [proSlideIndex, setProSlideIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(1);

  useEffect(() => {
    const updateItemsVisible = () => {
      if (window.innerWidth >= 1024) setItemsVisible(4);
      else if (window.innerWidth >= 768) setItemsVisible(2);
      else setItemsVisible(1);
    };
    updateItemsVisible();
    window.addEventListener('resize', updateItemsVisible);
    return () => window.removeEventListener('resize', updateItemsVisible);
  }, []);

  const specialtySlides = [
    {
      title: "Fisioterapia Traumato-Ortopédica",
      description: "Tratamento especializado para dores e reabilitação funcional.",
      image: "https://tuiuti.edu.br/wp-content/uploads/2022/12/shutterstock_1177541623.jpg",
      icon: Bone
    },
    {
      title: "Neurofuncional",
      description: "Reabilitação de AVC, Parkinson e lesões neurológicas.",
      image: "https://clinicamotricita.com.br/motri/images/treinodemarchacomsuspensoparcialdepeso.jpg",
      icon: Brain
    },
    {
      title: "Geriátrica",
      description: "Cuidado especializado para idosos.",
      image: "https://clinicaportal.com.br/wp-content/uploads/2021/02/Fisioterapia-para-idosos.jpg",
      icon: Heart
    }
  ];

  useEffect(() => {
    if (!authLoading && user && window.location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % specialtySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);

    let query = supabase
      .from('perfis')
      .select('*')
      .eq('tipo_usuario', 'fisioterapeuta')
      .eq('status_aprovacao', 'aprovado');

    if (nameQuery) {
      query = query.ilike('nome_completo', `%${nameQuery}%`);
    }

    if (locationQuery) {
      query = query.ilike('localizacao', `%${locationQuery}%`);
    }

    if (specialtyFilter !== 'Todos') {
      query = query.eq('especialidade', specialtyFilter);
    }

    const { data } = await query;

    const mapped: Professional[] =
      data?.map((p: any) => ({
        id: p.id,
        name: p.nome_completo,
        spec: p.especialidade,
        fullSpec: p.especialidade,
        img: resolveStorageUrl(p.avatar_url),
        rating: 5,
        reviews: Math.floor(Math.random() * 50),
        bio: p.bio,
        location: p.localizacao
      })) || [];

    setProfessionals(mapped);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchProfessionals, 300);
    return () => clearTimeout(timer);
  }, [nameQuery, locationQuery, specialtyFilter]);

  const nextProSlide = () => {
    setProSlideIndex((prev) =>
      Math.min(prev + 1, Math.max(0, professionals.length - itemsVisible))
    );
  };

  const prevProSlide = () => {
    setProSlideIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="bg-slate-950 text-white">

      {/* HERO */}
      <section className="min-h-[90vh] flex flex-col justify-center px-6">
        <motion.h1 className="text-5xl font-black">
          Saúde no seu lar
        </motion.h1>

        <p className="text-slate-400 mt-4">
          Conectamos fisioterapeutas e pacientes.
        </p>

        <div className="flex gap-4 mt-8">
          <Link to="/buscar-fisio" className="bg-blue-600 px-6 py-3 rounded-xl">
            Encontrar Fisioterapeuta
          </Link>
          <Link to="/register" className="border px-6 py-3 rounded-xl">
            Sou Fisioterapeuta
          </Link>
        </div>
      </section>

      {/* SLIDER */}
      <section className="px-6 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[400px] rounded-3xl overflow-hidden relative"
          >
            <img
              src={specialtySlides[currentSlide].image}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 p-10">
              <h2 className="text-3xl font-bold">
                {specialtySlides[currentSlide].title}
              </h2>
              <p>{specialtySlides[currentSlide].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* PROFESSIONALS */}
      <section className="px-6 py-20">
        <h2 className="text-3xl font-bold mb-6">Especialistas</h2>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{
              transform: `translateX(-${proSlideIndex * (100 / itemsVisible)}%)`
            }}
          >
            {professionals.map((p) => (
              <div
                key={p.id}
                className="w-full md:w-1/2 lg:w-1/4 p-4 flex-shrink-0"
              >
                <div className="bg-white/5 p-6 rounded-2xl">
                  <img
                    src={p.img}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <h3 className="mt-4 font-bold">{p.name}</h3>
                  <p className="text-sm text-slate-400">{p.spec}</p>
                  <Link
                    to={`/physio/${p.id}`}
                    className="mt-4 inline-block text-blue-400"
                  >
                    Ver perfil →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevProSlide} className="absolute left-0 top-1/2">
            ◀
          </button>
          <button onClick={nextProSlide} className="absolute right-0 top-1/2">
            ▶
          </button>
        </div>
      </section>

      <PhysioHighlight />
    </div>
  );
}
