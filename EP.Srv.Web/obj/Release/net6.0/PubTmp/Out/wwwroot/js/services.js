angular.module('gpca')
    .service('AuthService', function ($http, constants, toaster, $timeout, $localStorage, $loading) {

        var pars = {
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": constants.UrlAuthApi,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        }

        this.logar = function (obj) {
            $loading.start('load');

            return $http.post(constants.UrlAuthApi + 'Auth/Login', obj, pars)
                .then(function (response) {
                    if (response.data.authenticated) {
                        $loading.finish('load');

                        toaster.pop({
                            type: 'success',
                            title: 'Sucesso',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $localStorage.$reset();
                        $localStorage.user = response.data;

                        $timeout(function () {
                            window.location = "#/inicio/blank";
                        }, 2000);
                    }

                    else {
                        $localStorage.user = response.data;

                        toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $timeout(function () {
                            $loading.finish('load');
                        }, 500);
                    }
                }, function (error) {
                    $loading.finish('load');

                    if (error.data != null) {
                        angular.forEach(error.data, function (value, index) {
                            toaster.pop({
                                type: 'error',
                                title: value.propertyName,
                                body: value.errorMessage,
                                showCloseButton: true,
                                timeout: 5000
                            });
                        });
                    } else {
                        toaster.pop({
                            type: 'error',
                            title: 'Erro ao logar',
                            body: 'Ocorreu um erro inesperado no login.',
                            showCloseButton: true,
                            timeout: 5000
                        });
                    }
                });
        }

        this.cadastrar = function (obj) {
            $http.post(constants.UrlAuthApi + 'Auth/CreateUser', obj)
                .then(function (response) {
                    toaster.pop({
                        type: 'success',
                        title: 'Sucesso',
                        body: response.data.message,
                        showCloseButton: true,
                        timeout: 5000
                    });
                    $localStorage.user = response.data;
                    $timeout(function () {
                        window.location = "#/login";
                    }, 2000);
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        toaster.pop({
                            type: 'error',
                            title: value.propertyName,
                            body: value.errorMessage,
                            showCloseButton: true,
                            timeout: 5000
                        });
                    });
                });
        }

        this.RedefinirSenha = function (obj) {
            $http.post(constants.UrlAuthApi + 'Auth/RedefintionPassword', obj)
                .then(function (response) {
                    if (response.data.success) {

                        toaster.pop({
                            type: 'success',
                            title: 'Sucesso',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $localStorage.$reset();
                        $localStorage.user = response.data;

                        $timeout(function () {
                            window.location = "#/login";
                        }, 5000);
                    }
                    else {
                        $localStorage.error = response.data.message;

                        toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });
                    }
                }, function (error) {
                    $loading.finish('load');
                    angular.forEach(error.data, function (value, index) {
                        toaster.pop({
                            type: 'error',
                            title: value.propertyName,
                            body: value.errorMessage,
                            showCloseButton: true,
                            timeout: 5000
                        });
                    });
                });
        }

    })
    .service('ConsortiumService', function ($http, constants, $timeout, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.Create = function (obj) {
            $http.post(constants.UrlRelatorioApi + 'Consorcio/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Edit = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Consorcio/Update', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetConsorcio = function () {
            var obj = {};
            return $http.post(constants.UrlRelatorioApi + 'Consorcio/GetList', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Consorcio/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('ConsortiumJvService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.CreateJv = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ConsorcioJv/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EditJv = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ConsorcioJv/Edit', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetAll = function () {
            return $http.get(constants.UrlRelatorioApi + 'ConsorcioJv/GetAll')
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ConsorcioJv/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('NCMService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.Create = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'NCM/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Edit = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'NCM/Update', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetList = function () {
            var obj = {};
            return $http.post(constants.UrlRelatorioApi + 'NCM/GetList', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'NCM/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('MetaObjetoService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.Create = function (obj) {
            obj.planilha = parseInt(obj.planilha);
            return $http.post(constants.UrlRelatorioApi + 'MetaObjeto/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Edit = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'MetaObjeto/Update', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetMetaObjs = function () {
            var obj = {};
            return $http.post(constants.UrlRelatorioApi + 'MetaObjeto/GetList', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'MetaObjeto/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('TextoService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.Create = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Texto/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Edit = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Texto/Update', obj, params)
                .then(function (response) {
                    return response;
                });
        }

        this.GetList = function () {
            var obj = {};
            return $http.post(constants.UrlRelatorioApi + 'Texto/GetList', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Texto/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetAllPaginate = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'Texto/GetAllPaginate', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('CfopService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.Create = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'CFOP/Create', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Edit = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'CFOP/Update', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetList = function () {
            var obj = {};
            return $http.post(constants.UrlRelatorioApi + 'CFOP/GetList', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'cfop/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
    .service('RelatoriosService', function ($http, constants, $localStorage) {

        this.CreateExcel = function (date, flagReproc) {
            var params = {
                responseType: "blob",
                timeout: 300000,
                headers: {
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": constants.UrlRelatorioApi,
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                }
            };

            return $http.get(constants.UrlRelatorioApi + 'ArquivoConsolidado/Download?dateProccess=' + date + "&flagReprocessa=" + flagReproc, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetFiles = function () {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetFilesToImport', hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Importar = function (obj) {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.post(constants.UrlRelatorioApi + 'Relatorio/ImportFile', obj, hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.DownloadDuplicados = function (params) {
            $http({
                url: constants.UrlRelatorioApi + 'ArquivoConsolidado/DownloadDuplicados',
                method: 'POST',
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: params
            }).then(function (response) {
                var blob = new Blob([response.data], { type: 'application/octet-stream' });
                var url = window.URL.createObjectURL(blob);
                var link = document.createElement('a');
                link.href = url;
                link.download = 'Consolidacao Relatorios de Gastos Duplicados.xlsx';
                link.click();
            });
        }

        this.GetProcessedReports = function () {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetProcessedReports', hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetResumo = function (data) {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };

            return $http.get(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetResumo?dateProccess=' + data, hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetAll = function () {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoUpload/GetList', hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetImportedFiles = function () {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetImportedFilesAsync', hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        };
    })
    .service('ArquivoService', function ($http, constants, $localStorage) {
        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };

        this.GetAll = function () {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoUpload/GetList', hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Create = function (files, date) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoUpload/Upload?mesCompetencia=' + date, files, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EnableDisable = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoUpload/EnableDisable', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.LiberarTodos = function (mesCompetencia) {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.post(constants.UrlRelatorioApi + 'ArquivoUpload/LiberarTodos?mesCompetencia=' + mesCompetencia, hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Importar = function (id) {
            var hedrs = {
                headers: {
                    'RefreshToken': $localStorage.user.refreshToken
                }
            };
            return $http.get(constants.UrlRelatorioApi + 'ArquivoUpload/ImportarArquivo/' + id, hedrs)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.Delete = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoUpload/Delete', obj, params)
                .then(function (response) {
                    return response;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

    })
    .service('ManualService', function ($http, constants, $localStorage) {

        var params = {
            headers: {
                'RefreshToken': $localStorage.user.refreshToken
            }
        };


        this.GetH01 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetH01PaginateAsync', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetH02 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetH02PaginateAsync', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetH03 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetH03PaginateAsync', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetH04 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetH04PaginateAsync', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetH05 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/GetH05PaginateAsync', obj)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EditH01 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/EditH01Async', obj)
                .then(function (response) {
                    return response.data;
                });
        }

        this.EditH02 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/EditH02Async', obj)
                .then(function (response) {
                    return response.data;
                });
        }

        this.EditH03 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/EditH03Async', obj)
                .then(function (response) {
                    return response.data;
                });
        }

        this.EditH04 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/EditH04Async', obj)
                .then(function (response) {
                    return response.data;
                });
        }

        this.EditH05 = function (obj) {
            return $http.post(constants.UrlRelatorioApi + 'ArquivoConsolidado/EditH05Async', obj)
                .then(function (response) {
                    return response.data;
                });
        }

    })
    .service('UsuarioService', function ($http, constants, $localStorage) {

        var params = { headers: { 'RefreshToken': '' } };

        this.GetUsers = function () {
            var obj = {};
            params.headers.RefreshToken = $localStorage.user.refreshToken;

            return $http.post(constants.UrlAuthApi + 'User/GetUserAll', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EditUser = function (obj) {
            params.headers.RefreshToken = $localStorage.user.refreshToken;

            return $http.post(constants.UrlAuthApi + 'User/EditUser', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

    })
    .service('DashboardService', function ($http, constants, $localStorage) {

        this.GetDahsLine = function (year) {
            var params = { headers: { 'RefreshToken': $localStorage.user.refreshToken } };
            var obj = {
                anoCompetencia: year
            };

            return $http.post(constants.UrlRelatorioApi + 'Dashboard/GetDashLine', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetDahsLineItemtype = function (year) {
            var params = { headers: { 'RefreshToken': $localStorage.user.refreshToken } };
            var obj = {
                anoCompetencia: year
            };

            return $http.post(constants.UrlRelatorioApi + 'Dashboard/GetDashLineItemType', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetDahsTotal = function (year) {
            var params = { headers: { 'RefreshToken': $localStorage.user.refreshToken } };
            var obj = {
                anoCompetencia: year
            };

            return $http.post(constants.UrlRelatorioApi + 'Dashboard/GetTotal', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetDahsTotalMensal = function (data) {
            var params = { headers: { 'RefreshToken': $localStorage.user.refreshToken } };
            var obj = {
                dataCompetencia: data
            };

            return $http.post(constants.UrlRelatorioApi + 'Dashboard/GetTotalMensal', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.GetDashDoughnuts = function (data) {
            var params = { headers: { 'RefreshToken': $localStorage.user.refreshToken } };
            var obj = {
                dataCompetencia: data
            };

            return $http.post(constants.UrlRelatorioApi + 'Dashboard/GetDashDoughnuts', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }
    })
