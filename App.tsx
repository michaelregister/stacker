
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Header from './components/Header';
import StatCard from './components/StatCard';
import AddItemForm from './components/AddItemForm';
import Login from './components/Login';
import { fetchSpotPrice } from './services/geminiService';
import { MetalItem, SpotPriceData, MetalType } from './types';
import { auth, googleProvider } from './services/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';

const COLORS = ['#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#ca8a04', '#b45309', '#a16207'];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('stacker-theme');
    return saved ? saved === 'dark' : true; // Default to true
  });

  const [stack, setStack] = useState<MetalItem[]>([]);
  const [spotPrices, setSpotPrices] = useState<Record<MetalType, SpotPriceData | null>>({
    silver: null,
    gold: null,
  });
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof MetalItem; direction: 'ascending' | 'descending' } | null>({ key: 'addedAt', direction: 'descending' });
  const [chartDistribution, setChartDistribution] = useState<'category' | 'type'>('category');

   const sortedStack = useMemo(() => {
    let sortableItems = [...stack];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [stack, sortConfig]);

  const paginatedStack = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStack.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStack, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedStack.length / itemsPerPage);
  }, [sortedStack, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const requestSort = (key: keyof MetalItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const totalOunces = useMemo(() => {
    return stack.reduce((acc, item) => acc + item.totalOz, 0);
  }, [stack]);

  const weightsByType = useMemo(() => {
    const weights: Record<string, number> = {};
    stack.forEach(item => {
      weights[item.type] = (weights[item.type] || 0) + item.totalOz;
    });
    return weights;
  }, [stack]);

  const totalValue = useMemo(() => {
    return stack.reduce((acc, item) => {
      const price = spotPrices[item.type]?.price || 0;
      return acc + (item.totalOz * price);
    }, 0);
  }, [stack, spotPrices]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stacker-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stacker-theme', 'light');
    }
  }, [isDarkMode]);

  // Load user stack when user changes
  useEffect(() => {
    if (user) {
      fetch(`/api/stack/${user.email}`)
        .then(res => res.json())
        .then(data => {
          let loadedStack: any[] = [];
          if (data && data.stack) {
            loadedStack = Array.isArray(data.stack) ? data.stack : [];
            setPreviousValue(data.lastValue || 0);
          } else {
            // Backwards compatibility for old data format
            loadedStack = Array.isArray(data) ? data : [];
            setPreviousValue(0);
          }

          // Default to silver if type is missing
          const sanitizedStack = loadedStack.map(item => ({
            ...item,
            type: item.type || 'silver'
          }));

          setStack(sanitizedStack);
        })
        .catch(err => {
          console.error("Failed to load stack from server:", err);
          setStack([]);
          setPreviousValue(0);
        });
    } else {
      setStack([]);
      setPreviousValue(null);
    }
  }, [user]);

  // Persist user and stack
  useEffect(() => {
    if (user && stack.length > 0) { // Only save if there's a stack
      const dataToSave = {
        email: user.email,
        payload: {
          stack: stack,
          lastValue: totalValue,
          lastUpdated: new Date().toISOString()
        }
      };
      fetch('/api/stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      }).catch(err => console.error("Failed to save stack to server:", err));
    }
  }, [user, stack, totalValue]);

  // Price Loading
  useEffect(() => {
    const loadPrices = async () => {
      setIsPriceLoading(true);
      const typesInStack = [...new Set(stack.map(item => item.type))] as MetalType[];

      if (typesInStack.length === 0) {
        // Default to silver if stack is empty, or fetch both
        typesInStack.push('silver');
      }

      const pricePromises = typesInStack.map(type =>
        fetchSpotPrice(type).then(data => ({ type, data }))
      );

      try {
        const results = await Promise.all(pricePromises);
        const newPrices = { ...spotPrices };
        results.forEach(({ type, data }) => {
          newPrices[type] = data;
        });
        setSpotPrices(newPrices);
      } catch (error) {
        console.error("Failed to fetch spot prices", error);
      } finally {
        setIsPriceLoading(false);
      }
    };

    if (stack) { // Check if stack is not null
      loadPrices();
    }
  }, [stack]);





  const valueChange = useMemo(() => {
    if (previousValue === null || previousValue === 0 || totalValue === 0) {
      return null;
    }
    return totalValue - previousValue;
  }, [totalValue, previousValue]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    stack.forEach(item => {
      const key = chartDistribution === 'category'
        ? item.category.charAt(0).toUpperCase() + item.category.slice(1)
        : item.type.charAt(0).toUpperCase() + item.type.slice(1);
      data[key] = (data[key] || 0) + item.totalOz;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stack, chartDistribution]);

  const handleAddItem = (item: MetalItem) => {
    setStack(prev => [item, ...prev]);
  };

  const removeItem = (id: string) => {
    setStack(prev => prev.filter(item => item.id !== id));
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      user: user?.email || 'guest',
      exportedAt: new Date().toISOString(),
      stack: stack,
      currentSpotPrices: spotPrices
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `stacker_pro_portfolio_${user?.email || 'guest'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300`}>
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {!user ? (
          <div className="p-4">
            <Login />
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Total Weight"
                value={`${totalOunces.toLocaleString(undefined, { maximumFractionDigits: 2 })} oz`}
                subValue={
                  Object.keys(weightsByType).length > 0
                    ? Object.entries(weightsByType)
                        .sort((a, b) => b[1] - a[1])
                        .map(([type, weight]) => `${type.charAt(0).toUpperCase() + type.slice(1)}: ${weight.toLocaleString(undefined, { maximumFractionDigits: 2 })}oz`)
                        .join(' | ')
                    : `${(totalOunces * 0.0311).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`
                }
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                }
              />
              <StatCard
                label="Portfolio Value"
                value={totalValue === 0 ? "$0.00" : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={valueChange ? 'Since last session' : 'Based on spot prices'}
                change={valueChange}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              {Object.entries(spotPrices).map(([type, priceData]: [string, SpotPriceData | null]) => (
                priceData && (
                  <StatCard
                    key={type}
                    label={`${type.charAt(0).toUpperCase() + type.slice(1)} Spot Price`}
                    value={isPriceLoading ? "..." : `$${priceData.price.toFixed(2)}`}
                    subValue={"Market Data Sourced via AI"}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    }
                  />
                )
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AddItemForm onAdd={handleAddItem} user={user} />

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Stack</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.open('https://www.jmbullion.com/silver', '_blank')}
                        className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 border border-green-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        title="Buy silver from a reputable dealer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Buy Silver
                      </button>
                      <button
                        onClick={exportToJson}
                        disabled={stack.length === 0}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export JSON
                      </button>
                      <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-md">{stack.length} items</span>
                    </div>
                  </div>

                  {stack.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 dark:text-slate-600">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p>Your stack is empty. Add your first item above!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-6 py-3">
                                <button onClick={() => requestSort('name')} className="flex items-center gap-1">
                                  Item Details
                                  {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </button>
                              </th>
                              <th className="px-6 py-3">
                                <button onClick={() => requestSort('type')} className="flex items-center gap-1">
                                  Type
                                  {sortConfig?.key === 'type' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </button>
                              </th>
                              <th className="px-6 py-3 text-right">
                                <button onClick={() => requestSort('quantity')} className="flex items-center gap-1">
                                  Qty
                                  {sortConfig?.key === 'quantity' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </button>
                              </th>
                              <th className="px-6 py-3 text-right">
                                <button onClick={() => requestSort('ozPerUnit')} className="flex items-center gap-1">
                                  Unit Oz
                                  {sortConfig?.key === 'ozPerUnit' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </button>
                              </th>
                              <th className="px-6 py-3 text-right">
                                <button onClick={() => requestSort('totalOz')} className="flex items-center gap-1">
                                  Total Oz
                                  {sortConfig?.key === 'totalOz' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </button>
                              </th>
                              <th className="px-6 py-3"></th>
                            </tr>
                          </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {paginatedStack.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                                <div className="text-[10px] flex items-center gap-1.5 mt-1">
                                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-black uppercase tracking-tighter">{item.category}</span>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-slate-400 dark:text-slate-500 font-medium">{(item.purity * 100).toFixed(1)}% {item.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${item.type === 'silver' ? 'bg-slate-200 text-slate-600' : 'bg-yellow-200 text-yellow-800'}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                                {item.ozPerUnit} oz
                              </td>
                              <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white tabular-nums">
                                {item.totalOz.toFixed(2)} oz
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-slate-200 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                                  title="Remove item"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                          Previous
                        </button>
                        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-between">
                    <span>Distribution by Weight</span>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
                      <button
                        onClick={() => setChartDistribution('category')}
                        className={`px-2 py-1 rounded-md transition-colors ${chartDistribution === 'category' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                        Category
                      </button>
                      <button
                        onClick={() => setChartDistribution('type')}
                        className={`px-2 py-1 rounded-md transition-colors ${chartDistribution === 'type' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                      >
                        Metal
                      </button>
                    </div>
                  </h2>
                  <div className="h-64">
                    {stack.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)} oz`, 'Weight']}
                            contentStyle={{
                              borderRadius: '16px',
                              border: 'none',
                              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                              color: isDarkMode ? '#f1f5f9' : '#0f172a',
                              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 italic text-sm">
                        No items in stack
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {chartData.map((entry, index) => (
                      <div key={entry.name} className="flex justify-between items-center group">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{entry.name}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-slate-200 tabular-nums">
                          {((entry.value / totalOunces) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2 relative z-10">Market Sources</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed relative z-10">
                    AI-driven spot price updates. Each value is cross-referenced with real-time web results.
                  </p>
                  {Object.entries(spotPrices).map(([type, priceData]: [string, SpotPriceData | null]) => (
                    priceData && priceData.sources.length > 0 && (
                      <div key={type} className="mb-4">
                        <h4 className="text-sm font-bold text-slate-300 mb-2 capitalize">{type} Sources</h4>
                        <div className="space-y-3 relative z-10">
                          {priceData.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors group"
                            >
                              <span className="w-1 h-1 bg-slate-600 group-hover:bg-blue-400 rounded-full shrink-0"></span>
                              <span className="truncate">{source.title}</span>
                              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
