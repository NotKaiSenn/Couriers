import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BuildProject } from './data/mockData';
import { NavTab, TopNav } from './components/TopNav';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { PageTransition, TransitionPhase } from './components/PageTransition';

const loadPortfolioView = () =>
  import('./components/PortfolioBentoView').then((m) => ({ default: m.PortfolioBentoView }));
const loadMembersView = () =>
  import('./components/MembersView').then((m) => ({ default: m.MembersView }));
const loadJoinView = () =>
  import('./components/JoinView').then((m) => ({ default: m.JoinView }));
const loadProjectDetailPage = () =>
  import('./components/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }));

const PortfolioBentoView = lazy(loadPortfolioView);
const MembersView = lazy(loadMembersView);
const JoinView = lazy(loadJoinView);
const ProjectDetailPage = lazy(loadProjectDetailPage);

function prefetchTab(tab: NavTab) {
  if (tab === 'portfolio') void loadPortfolioView();
  else if (tab === 'members') void loadMembersView();
  else if (tab === 'join') void loadJoinView();
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeProject, setActiveProject] = useState<BuildProject | null>(null);
  const [returnTab, setReturnTab] = useState<NavTab>('portfolio');
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const returnScrollYRef = useRef<number>(0);
  const pendingScrollYRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingScrollYRef.current === null) return;
    const y = pendingScrollYRef.current;
    pendingScrollYRef.current = null;
    window.scrollTo({ top: y, behavior: 'instant' });
  }, [activeTab, activeProject]);

  const runPageTransition = (applyChange: () => void, targetScrollY = 0) => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    setTransitionPhase('in');

    const swapTimer = window.setTimeout(() => {
      setTransitionPhase('hold');
      pendingScrollYRef.current = targetScrollY;
      applyChange();
    }, 415);

    const outTimer = window.setTimeout(() => {
      setTransitionPhase('out');
    }, 520);

    const doneTimer = window.setTimeout(() => {
      setTransitionPhase('idle');
    }, 990);

    timersRef.current = [swapTimer, outTimer, doneTimer];
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === activeTab && !activeProject) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    prefetchTab(tab);

    runPageTransition(() => {
      setActiveProject(null);
      setActiveTab(tab);
    }, 0);
  };

  const handleOpenProject = (project: BuildProject, fromTab?: NavTab) => {
    if (!activeProject) {
      returnScrollYRef.current = window.scrollY;
    }
    const sourceTab = fromTab ?? (activeProject ? returnTab : activeTab);

    void loadProjectDetailPage();

    runPageTransition(() => {
      setReturnTab(sourceTab);
      setActiveProject(project);
    }, 0);
  };

  const handleBackFromProject = () => {
    prefetchTab(returnTab);

    runPageTransition(() => {
      setActiveProject(null);
      setActiveTab(returnTab);
    }, returnScrollYRef.current);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        activeTab={activeProject ? 'portfolio' : activeTab}
        onSelectTab={handleSelectTab}
        onPrefetchTab={prefetchTab}
      />

      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen bg-[#f5f6fb]" />}>
          {activeProject ? (
            <ProjectDetailPage
              project={activeProject}
              onBack={handleBackFromProject}
              onSelectProject={(next) => handleOpenProject(next)}
            />
          ) : activeTab === 'home' ? (
            <LandingPage
              onOpenProject={(project) => handleOpenProject(project, 'home')}
              onGoPortfolio={() => handleSelectTab('portfolio')}
              onGoMembers={() => handleSelectTab('members')}
              onGoJoin={() => handleSelectTab('join')}
              onPrefetchProjectDetail={() => void loadProjectDetailPage()}
              onPrefetchPortfolio={() => prefetchTab('portfolio')}
              onPrefetchMembers={() => prefetchTab('members')}
              onPrefetchJoin={() => prefetchTab('join')}
            />
          ) : activeTab === 'portfolio' ? (
            <PortfolioBentoView
              onOpenProject={(project) => handleOpenProject(project, 'portfolio')}
              onGoMembers={() => handleSelectTab('members')}
            />
          ) : activeTab === 'members' ? (
            <MembersView />
          ) : (
            <JoinView />
          )}
        </Suspense>
      </main>

      <Footer />

      <PageTransition phase={transitionPhase} />
    </div>
  );
}
