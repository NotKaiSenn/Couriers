import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BuildProject } from './data/mockData';
import { NavTab, TopNav } from './components/TopNav';
import { LandingPage } from './components/LandingPage';
import { PortfolioBentoView } from './components/PortfolioBentoView';
import { MembersView } from './components/MembersView';
import { JoinView } from './components/JoinView';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { Footer } from './components/Footer';
import { PageTransition, TransitionPhase } from './components/PageTransition';

export function App() {
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
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
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

    runPageTransition(() => {
      setReturnTab(sourceTab);
      setActiveProject(project);
    }, 0);
  };

  const handleBackFromProject = () => {
    runPageTransition(() => {
      setActiveProject(null);
      setActiveTab(returnTab);
    }, returnScrollYRef.current);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        activeTab={activeProject ? 'portfolio' : activeTab}
        isProjectPage={!!activeProject}
        onSelectTab={handleSelectTab}
      />

      <main className="flex-1">
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
      </main>

      <Footer />

      <PageTransition phase={transitionPhase} />
    </div>
  );
}

export default App;
