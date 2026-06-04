# Context7 Research Findings

> **v2 agents:** Primary ref for **Wokwi CLI**, **embed**, **automation scenarios**. EDA/SPICE/KiCad below = **legacy only** (not v2 plugin path).

## Wokwi (primary — et2)

- **Context7 library ID**: `/websites/wokwi`

### Query: *automation scenarios yaml*

- **Source**: https://docs.wokwi.com/pt-BR/wokwi-ci/automation-scenarios

```
name:'Your scenario name'
version:1
author:'Your name'

steps:
# List of steps:
-set-control:
part-id: btn1
control: pressed
value:1
-delay: 500ms
-wait-serial:'Button 1 pressed'
```

### Query: *automation scenarios yaml*

- **Source**: https://docs.wokwi.com/parts/wokwi-pushbutton

```
-set-control:
part-id: btn1
control: pressed
value:1
-delay: 200ms
-set-control:
part-id: btn1
control: pressed
value:0
```

### Query: *automation scenarios yaml*

- **Source**: https://docs.wokwi.com/parts/wokwi-mpu6050

```
-set-control:
  part-id: imu1
  control: temperature
  value:25
```

### Query: *automation scenarios yaml*

- **Source**: https://docs.wokwi.com/de-DE/parts/wokwi-potentiometer

```
- set-control:
  part-id: pot1
  control: position
  value: 0.5
```

### Query: *automation scenarios yaml*

- **Source**: https://docs.wokwi.com/parts/wokwi-photoresistor-sensor

```
-set-control:
  part-id: photoresistor1
  control: lux
  value:100
```

### Query: *wokwi-cli getting started*

- **Source**: https://docs.wokwi.com/zh-CN/wokwi-ci/cli-usage

```
wokwi-cli <your-project-directory>
```

### Query: *wokwi-cli getting started*

- **Source**: https://docs.wokwi.com/wokwi-ci/cli-usage

```
wokwi-cli init
```

### Query: *wokwi-cli getting started*

- **Source**: https://docs.wokwi.com/wokwi-ci/cli-installation

```
curl -L https://wokwi.com/ci/install.sh | sh
```


## KiCad / pcbnew (legacy)

- **API**: Yes — `kicad-python` / `kigadgets` over `pcbnew`.
- **Snippet**:
  ```python
  from kigadgets.board import Board

  pcb = Board.load("my_design.kicad_pcb")
  seg = pcb.add_track_segment((10, 10), (20, 10), layer="F.Cu", width=0.25)
  print(seg.start, seg.end)
  pcb.add_track([(0, 0), (5, 0), (5, 5), (10, 5)], layer="B.Cu", width=0.2)
  pcb.save()
  ```
- **Source**: https://context7.com/atait/kicad-python/llms.txt
- **Context7 library ID**: `/atait/kicad-python`

## PySpice (legacy)

- **API**: Yes — Python → Ngspice/Xyce.
- **Snippet**:
  ```python
  from PySpice.Spice.Netlist import Circuit
  from PySpice.Unit import *

  circuit = Circuit('Simulation Setup Example')
  circuit.V('input', 'node1', circuit.gnd, 1@u_V)
  circuit.R(1, 'node1', circuit.gnd, 1@u_kOhm)

  simulator = circuit.simulator(temperature=25, nominal_temperature=25)
  analysis = simulator.operating_point()
  print(f"Results: {analysis}")
  ```
- **Source**: https://pyspice.fabrice-salvaire.fr/releases/v1.5/index.html
- **Context7 library ID**: `/websites/pyspice_fabrice-salvaire_fr`

## skidl (legacy)

- **API**: Yes — compact circuit + netlist.
- **Snippet**:
  ```python
  reset()  # Clear existing circuitry.

  vs = SINEV(amplitude=1@u_V, frequency=1@u_GHz)
  t1 = T(impedance=70@u_Ohm, frequency=1@u_GHz, normalized_length=10.0)
  rload = R(value=140@u_Ohm)
  vs['p'] += t1['ip']
  rload[1] += t1['op']
  gnd += vs['n'], t1['in','on'], rload[2]
  ```
- **Source**: https://github.com/devbisme/skidl/blob/master/tests/examples/spice-sim-intro/spice-sim-intro.ipynb
- **Context7 library ID**: `/devbisme/skidl`

## lcapy (legacy)

- **API**: Yes — symbolic linear circuits.
- **Snippet**:
  ```python
  from lcapy import Circuit, s, t

  cct = Circuit("""
  Vs 2 0 {5 * u(t)}
  Ra 2 1
  Rb 1 0
  """)

  print(cct[1].V(t))
  print(cct.Ra.I(t))
  ```
- **Source**: https://github.com/mph-/lcapy/blob/master/README.md
- **Context7 library ID**: `/mph-/lcapy`

## Other EDA SDKs (legacy)

- **ngspice**
  - **API**: Yes — PySpice `NgSpiceShared` + C API.
  - **Snippet**:
    ```python
    import PySpice.Logging.Logging as Logging
    logger = Logging.setup_logging()
    from PySpice.Spice.NgSpice.Shared import NgSpiceShared

    ngspice = NgSpiceShared.new_instance()
    print(ngspice.exec_command('version -f'))

    ngspice.load_circuit(circuit)
    ngspice.run()
    print('Plots:', ngspice.plot_names)
    ```
  - Source: https://pyspice.fabrice-salvaire.fr/releases/v1.5/_sources/examples/ngspice-shared/ngspice-interpreter.rst.txt
  - Context7 library ID: `/websites/pyspice_fabrice-salvaire_fr`

- **Xyce**
  - **API**: Yes — C++ embedded sim.
  - **Snippet**:
    ```cpp
    #include <N_CIR_Xyce.h>
    #include <vector>
    #include <string>

    Xyce::Circuit::Simulator xyce(MPI_COMM_WORLD);
    std::vector<std::string> arguments;
    arguments.push_back("circuit.cir");

    Xyce::Circuit::Simulator::RunStatus status = xyce.initializeEarly(arguments);
    if (status != Xyce::Circuit::Simulator::SUCCESS) { return 1; }
    ```
  - Source: https://context7.com/xyce/xyce/llms.txt
  - Context7 library ID: `/xyce/xyce`

- **LTspice**
  - **API**: Yes — PyLTSpice.
  - **Snippet**:
    ```python
    from PyLTSpice import SimRunner, SpiceEditor

    runner = SimRunner(output_folder='./temp', verbose=True)
    netlist = SpiceEditor("circuit.net")
    runner.run(netlist)
    ```
  - Source: https://context7.com/nunobrum/pyltspice/llms.txt
  - Context7 library ID: `/nunobrum/pyltspice`

- **spicelib**
  - **API**: Yes — batch SPICE (LTspice, Ngspice, QSPICE, Xyce).
  - **Snippet**:
    ```python
    @classmethod
    def run(cls, netlist_file, cmd_line_switches=None, timeout=None,
            stdout=None, stderr=None, cwd=None, exe_log=False):
        cmd_run = cls.spice_exe + ['-Run'] + ['-b'] + [netlist_file] + cmd_line_switches
        return run_function(cmd_run, timeout=timeout, stdout=stdout, stderr=stderr, cwd=cwd)
    ```
  - Source: https://github.com/nunobrum/spicelib/blob/main/doc/classes/simulator_sim.md
  - Context7 library ID: `/nunobrum/spicelib`

- **Qucs** — no relevant Context7 library (unrelated hits). Skipped.


## Playwright (legacy browser automation)

- **WebSocket intercept**: `BrowserContext.routeWebSocket()` / `Page.routeWebSocket()` + `WebSocketRoute` — inspect/block/modify before server.
  ```javascript
  await context.routeWebSocket('/ws', async ws => {
    ws.routeSend(message => {
      if (message === 'to-be-blocked') return;
      ws.send(message);
    });
    await ws.connect();
  });
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-browsercontext.md

- **`page.evaluate()`**: run JS in browser; serializable result; args + Promise await.
  ```javascript
  const result = await page.evaluate(([x, y]) => {
    return Promise.resolve(x * y);
  }, [7, 8]);
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

- **Iframes**: `page.frameLocator(selector)` + chain locators; `contentFrame()` for nested frames.
  ```javascript
  await page.frameLocator('#my-iframe')
    .getByRole('button', { name: 'Submit' }).click();
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

- **Session persist**: `context.storageState()` → file; restore via `storageState` on `browser.newContext()`.
  ```python
  storage = await context.storage_state(path="state.json")
  context = await browser.new_context(storage_state="state.json")
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/auth.md

- **Bot flags**: `Page.addLocatorHandler()` for popups; `serviceWorkers: 'BLOCK'` in context options.
  ```javascript
  await page.addLocatorHandler(
    page.getByText('Sign up to the newsletter'),
    async () => await page.getByRole('button', { name: 'No thanks' }).click()
  );
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

## Puppeteer (legacy)

- **WebSocket**: no dedicated API; CDP or `page.setRequestInterception(true)` for HTTP-level.
  ```javascript
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (!req.isInterceptResolutionHandled()) req.continue();
  });
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **`page.evaluate()`**: fn/string in browser; args, Promises, `evaluateHandle()` for DOM nodes.
  ```javascript
  const title = await page.evaluate(() => document.title);
  const sum = await page.evaluate((a, b) => a + b, 10, 20);
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **Iframes**: `page.frames()` / `waitForFrame()`; `frame.evaluate/click/waitForNavigation`; `Promise.all` on click+navigate.
  ```javascript
  const [response] = await Promise.all([
    frame.waitForNavigation(),
    frame.click('a.my-link'),
  ]);
  ```
  - Source: https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.frame.waitfornavigation.md

- **Cookies**: `setCookie` / `cookies` / `deleteCookie`; pre-seed before nav; `createBrowserContext()` for isolation.
  ```javascript
  await browser.setCookie({
    name: 'session_token', value: 'abc123',
    domain: 'example.com', path: '/', httpOnly: true, secure: true
  });
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **Bot flags**: no stealth in Context7 core; disable Chrome features + request interception vs masking `navigator.webdriver`.
  ```javascript
  const browser = await puppeteer.launch({
    args: ['--disable-features=HttpsFirstBalancedModeAutoEnable'],
  });
  ```
  - Source: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
