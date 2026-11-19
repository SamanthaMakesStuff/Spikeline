import { Route, Routes } from 'react-router-dom';
import { AboutYou } from '../pages/AboutYou';
import { Hub } from '../pages/Hub';
import { HowItWorks } from '../pages/HowItWorks';
import { AboutTool, NextSteps, Privacy, Support } from '../pages/Info';
import { Question } from '../pages/Question';
import { Reflection } from '../pages/Reflection';
import { Settings } from '../pages/Settings';
import { Welcome } from '../pages/Welcome';
import { Layout, ViewLayout } from './Layout';
import { Results } from '../results/Results';
import { AreaDetail } from '../results/AreaDetail';
import { Share } from '../pages/Share';
import { Print } from '../pages/Print';
import { View } from '../pages/View';

export function App() {
  return (
    <Routes>
      <Route element={<ViewLayout />}>
        <Route path="/view" element={<View />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about-you" element={<AboutYou />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/q/:sectionId/:index" element={<Question />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/area/:spokeId" element={<AreaDetail />} />
        <Route path="/share" element={<Share />} />
        <Route path="/print" element={<Print />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/next-steps" element={<NextSteps />} />
        <Route path="/about-this-tool" element={<AboutTool />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Welcome />} />
      </Route>
    </Routes>
  );
}
