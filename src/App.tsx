import React, { useState, useMemo } from 'react';
import { Undo, MoreVertical, PersonStanding, ChevronDown, Play } from 'lucide-react';

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const svgAngle = 180 + angleInDegrees; 
  const angleInRadians = svgAngle * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
};

const WHO_CHART = [
  { minBmi: 16, maxBmi: 18.5, minAngle: 0, maxAngle: 40, color: '#C4D1BE' },
  { minBmi: 18.5, maxBmi: 25.0, minAngle: 40, maxAngle: 120, color: '#5D6D53' },
  { minBmi: 25.0, maxBmi: 30.0, minAngle: 120, maxAngle: 145, color: '#B78D6F' },
  { minBmi: 30.0, maxBmi: 40.0, minAngle: 145, maxAngle: 180, color: '#8E5340' },
];

const ASIAN_CHART = [
  { minBmi: 16, maxBmi: 18.5, minAngle: 0, maxAngle: 40, color: '#C4D1BE' },
  { minBmi: 18.5, maxBmi: 23.0, minAngle: 40, maxAngle: 100, color: '#5D6D53' },
  { minBmi: 23.0, maxBmi: 25.0, minAngle: 100, maxAngle: 130, color: '#C6A485' },
  { minBmi: 25.0, maxBmi: 30.0, minAngle: 130, maxAngle: 155, color: '#B78D6F' },
  { minBmi: 30.0, maxBmi: 40.0, minAngle: 155, maxAngle: 180, color: '#8E5340' },
];

const WHO_CATEGORIES = [
  { name: "Very Severely Underweight", label: "≤ 15.9", max: 15.9, color: "#C4D1BE", description: "Indicates significant health risks due to severe malnourishment. Medical attention is strongly recommended." },
  { name: "Severely Underweight", label: "16.0 – 16.9", min: 16.0, max: 16.9, color: "#C4D1BE", description: "Signifies a critically low body weight. Professional medical evaluation is advised to identify underlying causes." },
  { name: "Underweight", label: "17.0 – 18.4", min: 17.0, max: 18.4, color: "#C4D1BE", description: "Body weight is below the healthy range. A balanced diet and nutrition plan may help reach an optimal weight." },
  { name: "Normal", label: "18.5 – 24.9", min: 18.5, max: 24.9, color: "#5D6D53", description: "Healthy weight range associated with a lower risk of serious medical conditions. Maintained by a balanced lifestyle." },
  { name: "Overweight", label: "25.0 – 29.9", min: 25.0, max: 29.9, color: "#B78D6F", description: "Body weight is slightly above the healthy range. Increased risk of metabolic conditions. Lifestyle adjustments recommended." },
  { name: "Obese Class I", label: "30.0 – 34.9", min: 30.0, max: 34.9, color: "#9B6B54", description: "Moderate risk of weight-related health diseases such as type 2 diabetes and hypertension. Medical advice may be beneficial." },
  { name: "Obese Class II", label: "35.0 – 39.9", min: 35.0, max: 39.9, color: "#8E5340", description: "High risk of weight-related health issues. A structured weight management plan is highly recommended." },
  { name: "Obese Class III", label: "≥ 40.0", min: 40.0, max: 999, color: "#724030", description: "Very high risk of severe health complications. Immediate professional medical and dietary intervention is strongly advised." }
];

const ASIAN_CATEGORIES = [
  { name: "Underweight", label: "≤ 18.4", max: 18.4, color: "#C4D1BE", description: "Body weight is below optimal. Increased susceptibility to infections and other health issues." },
  { name: "Normal", label: "18.5 – 22.9", min: 18.5, max: 22.9, color: "#5D6D53", description: "Optimal weight range for Asian populations, associated with the lowest health risks." },
  { name: "Overweight", label: "23.0 – 24.9", min: 23.0, max: 24.9, color: "#C6A485", description: "In Asian populations, risks for cardiovascular diseases and diabetes begin to increase at this lower threshold." },
  { name: "Obese Class I", label: "25.0 – 29.9", min: 25.0, max: 29.9, color: "#B78D6F", description: "Significant risk for weight-related diseases, particularly abdominal obesity complications common in Asian ethnicity." },
  { name: "Obese Class II", label: "≥ 30.0", min: 30.0, max: 999, color: "#8E5340", description: "Severe risk for metabolic and cardiovascular conditions. Comprehensive medical management is necessary." }
];

export default function App() {
  const [age, setAge] = useState<number | ''>(58);
  const [standard, setStandard] = useState<'WHO' | 'Asian'>('WHO');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  
  const [heightCm, setHeightCm] = useState<number | ''>(154);
  const [weightKg, setWeightKg] = useState<number | ''>(64.5);
  const [heightFt, setHeightFt] = useState<number | ''>(5);
  const [heightIn, setHeightIn] = useState<number | ''>(1);
  const [weightLbs, setWeightLbs] = useState<number | ''>(142);

  const reset = () => {
    setAge(58);
    setHeightCm(154);
    setWeightKg(64.5);
    setHeightFt(5);
    setHeightIn(1);
    setWeightLbs(142);
    setStandard('WHO');
    setHeightUnit('cm');
    setWeightUnit('kg');
  };

  const computedHeightCm = heightUnit === 'cm' 
    ? Number(heightCm) 
    : (Number(heightFt) * 12 + Number(heightIn)) * 2.54;

  const computedWeightKg = weightUnit === 'kg'
    ? Number(weightKg)
    : Number(weightLbs) * 0.453592;

  const bmi = useMemo(() => {
    if (!computedWeightKg || !computedHeightCm) return 0;
    const heightM = computedHeightCm / 100;
    return computedWeightKg / (heightM * heightM);
  }, [computedHeightCm, computedWeightKg]);

  const categories = standard === 'WHO' ? WHO_CATEGORIES : ASIAN_CATEGORIES;
  const chartDef = standard === 'WHO' ? WHO_CHART : ASIAN_CHART;

  const currentCat = useMemo(() => {
    return categories.find(c => {
      const isAboveMin = c.min === undefined || bmi >= c.min;
      const isBelowMax = c.max === undefined || bmi <= c.max;
      return isAboveMin && isBelowMax;
    }) || categories[0];
  }, [bmi, categories]);

  const differenceCalc = useMemo(() => {
    if (!computedHeightCm || !computedWeightKg || !bmi) return { text: weightUnit === 'kg' ? '0.0 kg' : '0.0 lbs', val: 0 };
    const heightM = computedHeightCm / 100;
    const normalMinKg = 18.5 * heightM * heightM;
    const normalMaxKg = (standard === 'WHO' ? 24.9 : 22.9) * heightM * heightM;
    
    let diffKg = 0;
    if (computedWeightKg > normalMaxKg) {
      diffKg = computedWeightKg - normalMaxKg;
      return { text: `+${weightUnit === 'kg' ? diffKg.toFixed(1) + ' kg' : (diffKg * 2.20462).toFixed(1) + ' lbs'}`, val: diffKg };
    } else if (computedWeightKg < normalMinKg) {
      diffKg = normalMinKg - computedWeightKg;
      return { text: `-${weightUnit === 'kg' ? diffKg.toFixed(1) + ' kg' : (diffKg * 2.20462).toFixed(1) + ' lbs'}`, val: diffKg };
    }
    return { text: weightUnit === 'kg' ? '0.0 kg' : '0.0 lbs', val: 0 };
  }, [bmi, computedHeightCm, computedWeightKg, standard, weightUnit]);

  const needleAngle = useMemo(() => {
    if (!bmi) return 0;
    if (bmi <= 16) return 0;
    if (bmi >= 40) return 180;
    for (const seg of chartDef) {
      if (bmi >= seg.minBmi && bmi <= seg.maxBmi) {
        const frac = (bmi - seg.minBmi) / (seg.maxBmi - seg.minBmi);
        return seg.minAngle + frac * (seg.maxAngle - seg.minAngle);
      }
    }
    return 0;
  }, [bmi, chartDef]);

  const needlePos = polarToCartesian(100, 100, 80, needleAngle);
  const visibleLabels = standard === 'WHO' ? [16.0, 18.5, 25.0, 40.0] : [16.0, 18.5, 23.0, 25.0, 40.0];

  const heightM = (Number(computedHeightCm)) / 100 || 0;
  const normalMinKg = heightM ? (18.5 * heightM * heightM) : 0;
  const normalMaxKg = heightM ? ((standard === 'WHO' ? 24.9 : 22.9) * heightM * heightM) : 0;

  const normalMinStr = heightM ? (weightUnit === 'kg' ? normalMinKg.toFixed(1) : (normalMinKg * 2.20462).toFixed(1)) : '0';
  const normalMaxStr = heightM ? (weightUnit === 'kg' ? normalMaxKg.toFixed(1) : (normalMaxKg * 2.20462).toFixed(1)) : '0';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D3D3D] font-sans mx-auto max-w-md shadow-2xl overflow-hidden flex flex-col relative pb-0 border-x border-[#E6E5DF]">
      
      <header className="flex justify-between items-center p-6 bg-[#FDFBF7] border-b border-[#E6E5DF] text-[#2A2A2A] sticky top-0 z-10">
        <h1 className="text-xl font-semibold tracking-tight text-[#2A2A2A]">BMI Calculator</h1>
        <div className="flex items-center gap-4">
          <Undo onClick={reset} className="w-5 h-5 cursor-pointer text-[#5D6D53] hover:text-[#2A2A2A] transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer text-[#5D6D53] hover:text-[#2A2A2A] transition-colors" />
        </div>
      </header>
      
      <div className="p-8 flex flex-col gap-6 bg-[#F2F1EC] mx-4 mt-6 rounded-[32px] border border-[#E6E5DF]">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] uppercase tracking-widest text-[#5D6D53] font-bold mb-2 ml-1">Standard</label>
            <div className="bg-white rounded-full p-1 border border-[#E6E5DF] flex shadow-sm">
              <button 
                onClick={() => setStandard('WHO')}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors ${standard === 'WHO' ? 'bg-[#5D6D53] text-white' : 'text-[#7D7C75] hover:bg-gray-50'}`}>WHO</button>
              <button 
                onClick={() => setStandard('Asian')}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors ${standard === 'Asian' ? 'bg-[#5D6D53] text-white' : 'text-[#7D7C75] hover:bg-gray-50'}`}>Asian</button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center items-center mb-2 h-[20px]">
              <label className="text-[11px] uppercase tracking-widest text-[#5D6D53] font-bold">Age</label>
            </div>
            <input 
              type="number" 
              value={age} 
              onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
              className="w-16 bg-white border border-[#E6E5DF] rounded-xl text-[#2A2A2A] text-2xl font-serif text-center py-2 focus:outline-none focus:ring-2 focus:ring-[#5D6D53]/20 transition-all shadow-sm" 
            />
          </div>
          <div className="flex flex-col items-center flex-1 ml-4 border-l border-[#E6E5DF] pl-4">
            <div className="w-full flex justify-between items-center mb-2 px-1 h-[20px]">
              <label className="text-[11px] uppercase tracking-widest text-[#5D6D53] font-bold">Height</label>
              <button 
                onClick={() => setHeightUnit(u => u === 'cm' ? 'ft' : 'cm')}
                className="text-[9px] uppercase font-bold text-[#7D7C75] bg-[#E6E9E0] px-2 py-[2px] rounded shadow-sm hover:bg-[#D5D8CF] transition-colors tracking-wider"
               >
                 {heightUnit === 'cm' ? 'ft/in' : 'cm'}
               </button>
            </div>
            {heightUnit === 'cm' ? (
              <div className="flex items-center gap-1 bg-white border border-[#E6E5DF] rounded-xl text-[#2A2A2A] text-2xl font-serif focus-within:ring-2 focus-within:ring-[#5D6D53]/20 transition-all shadow-sm overflow-hidden px-1 py-1 w-full justify-center">
                <input 
                  type="number" 
                  value={heightCm} 
                  onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                  className="w-16 bg-transparent text-center focus:outline-none py-1" 
                />
                <div className="text-[#7D7C75] flex items-center text-sm font-sans font-medium mr-3">cm</div>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white border border-[#E6E5DF] rounded-xl text-[#2A2A2A] text-2xl font-serif focus-within:ring-2 focus-within:ring-[#5D6D53]/20 transition-all shadow-sm overflow-hidden px-1 py-1 w-full justify-center">
                <input 
                  type="number" 
                  value={heightFt} 
                  onChange={e => setHeightFt(e.target.value ? Number(e.target.value) : '')}
                  className="w-8 bg-transparent text-center focus:outline-none py-1" 
                />
                <div className="text-[#7D7C75] flex items-center text-sm font-sans font-medium">ft</div>
                <input 
                  type="number" 
                  value={heightIn} 
                  onChange={e => setHeightIn(e.target.value ? Number(e.target.value) : '')}
                  className="w-10 bg-transparent text-center focus:outline-none py-1 border-l border-[#E6E5DF] pl-1 ml-1" 
                />
                <div className="text-[#7D7C75] flex items-center text-sm font-sans font-medium mr-1">in</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end pt-2">
          <div className="flex items-center gap-1 text-[#5D6D53] mr-2">
             <PersonStanding className="w-12 h-12" /> 
             <PersonStanding className="w-10 h-10 opacity-40 -ml-2" /> 
          </div>
          <div className="flex flex-col items-center flex-1 ml-2">
            <div className="w-full flex justify-between items-center mb-2 px-1 h-[20px]">
              <label className="text-[11px] uppercase tracking-widest text-[#5D6D53] font-bold">Weight</label>
              <button 
                onClick={() => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg')}
                className="text-[9px] uppercase font-bold text-[#7D7C75] bg-[#E6E9E0] px-2 py-[2px] rounded shadow-sm hover:bg-[#D5D8CF] transition-colors tracking-wider"
               >
                 {weightUnit === 'kg' ? 'lbs' : 'kg'}
               </button>
            </div>
            {weightUnit === 'kg' ? (
              <div className="flex items-center gap-1 bg-white border border-[#E6E5DF] rounded-xl text-[#2A2A2A] text-2xl font-serif focus-within:ring-2 focus-within:ring-[#5D6D53]/20 transition-all shadow-sm overflow-hidden px-1 py-1 w-full justify-center">
                <input 
                  type="number" 
                  value={weightKg} 
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-16 bg-transparent text-center focus:outline-none py-1" 
                />
                <div className="text-[#7D7C75] flex items-center text-sm font-sans font-medium mr-3">kg</div>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white border border-[#E6E5DF] rounded-xl text-[#2A2A2A] text-2xl font-serif focus-within:ring-2 focus-within:ring-[#5D6D53]/20 transition-all shadow-sm overflow-hidden px-1 py-1 w-full justify-center">
                <input 
                  type="number" 
                  value={weightLbs} 
                  onChange={e => setWeightLbs(e.target.value ? Number(e.target.value) : '')}
                  className="w-16 bg-transparent text-center focus:outline-none py-1" 
                />
                <div className="text-[#7D7C75] flex items-center text-sm font-sans font-medium mr-3">lbs</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-8 mt-6 flex flex-col items-center relative overflow-hidden select-none bg-[#E6E9E0] mx-4 rounded-[32px]">
         <svg width="320" height="150" viewBox="-30 -20 260 140" className="overflow-visible">
           {chartDef.map((seg, i) => (
              <path
                key={i}
                d={describeArc(100, 100, 80, seg.minAngle, seg.maxAngle)}
                fill="none"
                stroke={seg.color}
                strokeWidth={8}
                strokeLinecap="butt"
              />
           ))}

           <defs>
             <path id="text-curve" d={describeArc(100, 100, 92, 0, 180)} />
           </defs>
           
           <text fontSize="11" fill="#7D7C75" fontWeight="bold">
             <textPath href="#text-curve" startOffset="11.1%" textAnchor="middle">Underweight</textPath>
           </text>
           <text fontSize="12" fill="#2A2A2A" fontWeight="bold">
             <textPath href="#text-curve" startOffset={standard === 'WHO' ? "44.4%" : "38.9%"} textAnchor="middle">Normal</textPath>
           </text>
           <text fontSize="11" fill="#B78D6F" fontWeight="bold">
             <textPath href="#text-curve" startOffset={standard === 'WHO' ? "73.6%" : "63.9%"} textAnchor="middle">Overweight</textPath>
           </text>
           <text fontSize="11" fill="#8E5340" fontWeight="bold">
             <textPath href="#text-curve" startOffset={standard === 'WHO' ? "90.3%" : "86.1%"} textAnchor="middle">Obese</textPath>
           </text>
           
           {visibleLabels.map(val => {
              let posAngle = 0;
              if (val <= 16) posAngle = 0;
              else if (val >= 40) posAngle = 180;
              else {
                for (const seg of chartDef) {
                  if (val >= seg.minBmi && val <= seg.maxBmi) {
                    const frac = (val - seg.minBmi) / (seg.maxBmi - seg.minBmi);
                    posAngle = seg.minAngle + frac * (seg.maxAngle - seg.minAngle);
                    break;
                  }
                }
              }
              const p = polarToCartesian(100, 100, 64, posAngle);
              const rotation = posAngle - 90;
              return (
                <text 
                  key={val}
                  x={p.x} 
                  y={p.y} 
                  fontSize="8" 
                  fill="#7D7C75" 
                  fontWeight="bold"
                  textAnchor="middle" 
                  transform={`rotate(${rotation} ${p.x} ${p.y})`}
                >
                  {val.toFixed(1)}
                </text>
              );
           })}

           {bmi > 0 && (
             <circle 
               cx={needlePos.x} 
               cy={needlePos.y} 
               r={6} 
               fill={currentCat.color} 
               stroke="#E6E9E0" 
               strokeWidth={2} 
               className="transition-all duration-300 ease-out"
             />
           )}
         </svg>

         <div className="absolute top-[115px] flex flex-col items-center">
           <span className="text-[11px] uppercase tracking-[0.2em] text-[#5D6D53] font-bold mb-[-8px]">Index</span>
           <span className="text-[56px] font-serif leading-none" style={{ color: currentCat.color }}>
             {bmi ? bmi.toFixed(1) : '0.0'}
           </span>
         </div>
      </div>
      
      <div className="px-8 mt-6">
        <div className="bg-[#F2F1EC] rounded-2xl p-5 border border-[#E6E5DF] shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentCat.color }}></span>
            <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: currentCat.color }}>{currentCat.name}</span>
          </div>
          <p className="text-[13px] text-[#2A2A2A] leading-relaxed">
            {currentCat.description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-[#7D7C75] text-[11px] uppercase tracking-widest font-bold">
            <span>Category</span>
            <span>Difference</span>
          </div>
          <div className="flex justify-between font-serif text-[26px] pb-1 leading-none" style={{ color: currentCat.color }}>
            <span>{currentCat.name}</span>
            <span>{differenceCalc.text}</span>
          </div>

          <div className="border-t border-[#E6E5DF] pt-4 mt-2 flex flex-col text-[13px] text-[#7D7C75] gap-1.5 pb-2">
            {categories.map((c, i) => {
              const isCurrent = bmi >= (c.min || 0) && bmi <= (c.max || 9999);
              return (
                <div key={i} className={`flex justify-between items-center transition-colors ${isCurrent ? 'text-[#2A2A2A] font-bold' : ''}`}>
                  <div className="flex items-center">
                    <span className={`w-4 flex items-center ${isCurrent ? 'opacity-100' : 'opacity-0'}`} style={{ color: c.color }}>
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                    <span>{c.name}</span>
                  </div>
                  <span className="tracking-wide text-[13px]">{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto mx-4 mb-4 mt-4 px-6 py-4 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold rounded-2xl bg-[#F2F1EC] text-[#5D6D53] border border-[#E6E5DF]">
        <span>Normal Weight Range</span>
        <span>{normalMinStr} – {normalMaxStr} {weightUnit === 'kg' ? 'kg' : 'lbs'}</span>
      </div>

    </div>
  );
}
