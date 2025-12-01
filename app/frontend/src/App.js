 {/* Admin Panel Modal */}
      {showAdmin && (
        <div className=\"fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4\">
          {!isAdminLoggedIn ? (
            // Login forma
            <div className=\"bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700\">
              <div className=\"text-center mb-6\">
                <div className=\"w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4\">
                  <svg className=\"w-8 h-8 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\" />
                  </svg>
                </div>
                <h2 className=\"text-2xl font-bold text-white\">Admin Prijava</h2>
                <p className=\"text-gray-400 text-sm mt-1\">Unesite vaše podatke za pristup</p>
              </div>
              <div className=\"space-y-4\">
                <div>
                  <label className=\"block text-gray-300 font-medium mb-2 text-sm\">
                    Username
                  </label>
                  <input
                    type=\"text\"
                    placeholder=\"Unesite korisničko ime\"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className=\"w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent\"
                  />
                </div>
                <div>
                  <label className=\"block text-gray-300 font-medium mb-2 text-sm\">
                    Password
                  </label>
                  <input
                    type=\"password\"
                    placeholder=\"Unesite lozinku\"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className=\"w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent\"
                  />
                </div>
                <button 
                  onClick={handleAdminLogin}
                  className=\"w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all mt-2\"
                >
                  Prijavi se
                </button>
                <button 
                  onClick={() => { setShowAdmin(false); setAdminUsername(\"\"); setAdminPassword(\"\"); }}
                  className=\"w-full text-gray-400 py-2 hover:text-white transition-colors\"
                >
                  Zatvori
                </button>
              </div>
            </div>
          ) : (
            // Admin Panel Dashboard
            <div className=\"bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-6xl w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-hidden flex flex-col\">
              {/* Header */}
              <div className=\"flex justify-between items-center mb-6 pb-4 border-b border-gray-700\">
                <div className=\"flex items-center gap-3\">
                  <div className=\"w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center\">
                    <svg className=\"w-6 h-6 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" />
                    </svg>
                  </div>
                  <div>
                    <h2 className=\"text-xl font-bold text-white\">Administratorska Ploča</h2>
                    <p className=\"text-gray-400 text-sm\">Upravljanje zahtjevima za aktivaciju</p>
                  </div>
                </div>
                <div className=\"flex items-center gap-3\">
                  <span className=\"text-gray-400 text-sm\">Prijavljeni kao: <span className=\"text-purple-400 font-medium\">admin</span></span>
                  <button 
                    onClick={handleLogout}
                    className=\"bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-600/30 transition-colors\"
                  >
                    Odjava
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className=\"grid grid-cols-4 gap-4 mb-6\">
                <div className=\"bg-gray-800/50 rounded-xl p-4 border border-gray-700\">
                  <p className=\"text-gray-400 text-sm\">Ukupno zahtjeva</p>
                  <p className=\"text-2xl font-bold text-white\">{requests.length}</p>
                </div>
                <div className=\"bg-gray-800/50 rounded-xl p-4 border border-gray-700\">
                  <p className=\"text-gray-400 text-sm\">Na čekanju</p>
                  <p className=\"text-2xl font-bold text-yellow-400\">{requests.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className=\"bg-gray-800/50 rounded-xl p-4 border border-gray-700\">
                  <p className=\"text-gray-400 text-sm\">Odobreno</p>
                  <p className=\"text-2xl font-bold text-green-400\">{requests.filter(r => r.status === 'approved').length}</p>
                </div>
                <div className=\"bg-gray-800/50 rounded-xl p-4 border border-gray-700\">
                  <p className=\"text-gray-400 text-sm\">Odbijeno</p>
                  <p className=\"text-2xl font-bold text-red-400\">{requests.filter(r => r.status === 'rejected').length}</p>
                </div>
              </div>
              
              {/* Table */}
              <div className=\"flex-1 overflow-auto\">
                <table className=\"w-full\">
                  <thead className=\"sticky top-0\">
                    <tr className=\"bg-gray-800\">
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">MAC Adresa</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Ključ Uređaja</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Plan</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Cijena</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Datum</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Status</th>
                      <th className=\"px-4 py-3 text-left text-gray-400 font-medium text-sm\">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className=\"border-b border-gray-700/50 hover:bg-gray-800/30\">
                        <td className=\"px-4 py-4 text-white font-mono text-sm\">{req.mac}</td>
                        <td className=\"px-4 py-4 text-gray-300 text-sm\">{req.key}</td>
                        <td className=\"px-4 py-4 text-gray-300 text-sm\">{req.plan}</td>
                        <td className=\"px-4 py-4 text-purple-400 font-semibold text-sm\">{req.price}</td>
                        <td className=\"px-4 py-4 text-gray-400 text-sm\">{req.date} {req.time}</td>
                        <td className=\"px-4 py-4\">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {req.status === 'approved' ? '✓ Odobreno' : 
                             req.status === 'rejected' ? '✗ Odbijeno' : '⏳ Na čekanju'}
                          </span>
                        </td>
                        <td className=\"px-4 py-4\">
                          <div className=\"flex gap-2\">
                            {req.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(req.id)}
                                  className=\"bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors\"
                                >
                                  Odobri
                                </button>
                                <button 
                                  onClick={() => handleReject(req.id)}
                                  className=\"bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors\"
                                >
                                  Odbij
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => handleDelete(req.id)}
                              className=\"bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors\"
                            >
                              Obriši
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {requests.length === 0 && (
                  <div className=\"text-center py-12\">
                    <div className=\"w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4\">
                      <svg className=\"w-8 h-8 text-gray-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" />
                      </svg>
                    </div>
                    <p className=\"text-gray-500\">Nema zahtjeva za aktivaciju</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}" --new-str "      {/* Admin Panel Modal */}
      {showAdmin && (
        <div className=\"fixed inset-0 bg-gray-900 z-50 overflow-hidden\">
          {!isAdminLoggedIn ? (
            // Login forma - centrirana
            <div className=\"min-h-screen flex items-center justify-center p-4\">
              <div className=\"bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700\">
                <div className=\"text-center mb-6\">
                  <div className=\"w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4\">
                    <svg className=\"w-8 h-8 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\" />
                    </svg>
                  </div>
                  <h2 className=\"text-2xl font-bold text-white\">Admin Prijava</h2>
                  <p className=\"text-gray-400 text-sm mt-1\">Unesite vaše podatke za pristup</p>
                </div>
                <div className=\"space-y-4\">
                  <div>
                    <label className=\"block text-gray-300 font-medium mb-2 text-sm\">
                      Username
                    </label>
                    <input
                      type=\"text\"
                      placeholder=\"Unesite korisničko ime\"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className=\"w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent\"
                    />
                  </div>
                  <div>
                    <label className=\"block text-gray-300 font-medium mb-2 text-sm\">
                      Password
                    </label>
                    <input
                      type=\"password\"
                      placeholder=\"Unesite lozinku\"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                      className=\"w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent\"
                    />
                  </div>
                  <button 
                    onClick={handleAdminLogin}
                    className=\"w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all mt-2\"
                  >
                    Prijavi se
                  </button>
                  <button 
                    onClick={() => { setShowAdmin(false); setAdminUsername(\"\"); setAdminPassword(\"\"); }}
                    className=\"w-full text-gray-400 py-2 hover:text-white transition-colors\"
                  >
                    Zatvori
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Admin Panel Dashboard - FULLSCREEN
            <div className=\"h-screen flex flex-col\">
              {/* Header */}
              <div className=\"bg-gray-800 border-b border-gray-700 px-6 py-4\">
                <div className=\"flex justify-between items-center\">
                  <div className=\"flex items-center gap-3\">
                    <div className=\"w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center\">
                      <svg className=\"w-6 h-6 text-white\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z\" />
                      </svg>
                    </div>
                    <div>
                      <h2 className=\"text-xl font-bold text-white\">Administratorska Ploča</h2>
                      <p className=\"text-gray-400 text-sm\">Upravljanje zahtjevima za aktivaciju</p>
                    </div>
                  </div>
                  <div className=\"flex items-center gap-4\">
                    <span className=\"text-gray-400 text-sm\">Prijavljeni kao: <span className=\"text-purple-400 font-medium\">admin</span></span>
                    <button 
                      onClick={handleLogout}
                      className=\"bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-600/30 transition-colors border border-red-600/30\"
                    >
                      Odjava
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className=\"bg-gray-850 px-6 py-4 border-b border-gray-700\">
                <div className=\"grid grid-cols-4 gap-4\">
                  <div className=\"bg-gray-800 rounded-xl p-4 border border-gray-700\">
                    <p className=\"text-gray-400 text-sm\">Ukupno zahtjeva</p>
                    <p className=\"text-3xl font-bold text-white\">{requests.length}</p>
                  </div>
                  <div className=\"bg-gray-800 rounded-xl p-4 border border-gray-700\">
                    <p className=\"text-gray-400 text-sm\">Na čekanju</p>
                    <p className=\"text-3xl font-bold text-yellow-400\">{requests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <div className=\"bg-gray-800 rounded-xl p-4 border border-gray-700\">
                    <p className=\"text-gray-400 text-sm\">Odobreno</p>
                    <p className=\"text-3xl font-bold text-green-400\">{requests.filter(r => r.status === 'approved').length}</p>
                  </div>
                  <div className=\"bg-gray-800 rounded-xl p-4 border border-gray-700\">
                    <p className=\"text-gray-400 text-sm\">Odbijeno</p>
                    <p className=\"text-3xl font-bold text-red-400\">{requests.filter(r => r.status === 'rejected').length}</p>
                  </div>
                </div>
              </div>
              
              {/* Table Container */}
              <div className=\"flex-1 overflow-auto px-6 py-4\">
                <div className=\"bg-gray-800 rounded-xl border border-gray-700 overflow-hidden\">
                  <table className=\"w-full\">
                    <thead className=\"sticky top-0\">
                      <tr className=\"bg-gray-750 border-b border-gray-700\">
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">MAC Adresa</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Ključ Uređaja</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Plan</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Cijena</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Datum</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Status</th>
                        <th className=\"px-6 py-4 text-left text-gray-400 font-medium text-sm uppercase tracking-wider\">Akcije</th>
                      </tr>
                    </thead>
                    <tbody className=\"divide-y divide-gray-700\">
                      {requests.map((req) => (
                        <tr key={req.id} className=\"hover:bg-gray-750/50 transition-colors\">
                          <td className=\"px-6 py-4 text-white font-mono text-sm\">{req.mac}</td>
                          <td className=\"px-6 py-4 text-gray-300 text-sm\">{req.key}</td>
                          <td className=\"px-6 py-4 text-gray-300 text-sm\">{req.plan}</td>
                          <td className=\"px-6 py-4 text-purple-400 font-semibold text-sm\">{req.price}</td>
                          <td className=\"px-6 py-4 text-gray-400 text-sm\">{req.date} {req.time}</td>
                          <td className=\"px-6 py-4\">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              req.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {req.status === 'approved' ? '✓ Odobreno' : 
                               req.status === 'rejected' ? '✗ Odbijeno' : '⏳ Na čekanju'}
                            </span>
                          </td>
                          <td className=\"px-6 py-4\">
                            <div className=\"flex gap-2\">
                              {req.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(req.id)}
                                    className=\"bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors\"
                                  >
                                    Odobri
                                  </button>
                                  <button 
                                    onClick={() => handleReject(req.id)}
                                    className=\"bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors\"
                                  >
                                    Odbij
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDelete(req.id)}
                                className=\"bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors\"
                              >
                                Obriši
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {requests.length === 0 && (
                    <div className=\"text-center py-16\">
                      <div className=\"w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4\">
                        <svg className=\"w-10 h-10 text-gray-500\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" />
                        </svg>
                      </div>
                      <p className=\"text-gray-500 text-lg\">Nema zahtjeva za aktivaciju</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}"
