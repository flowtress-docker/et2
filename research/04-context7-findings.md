# Context7 Research Findings

## KiCad / pcbnew

- **Programmatic/API interface**: Yes (via `kicad-python` / `kigadgets` wrapper over native `pcbnew` module).
- **Example snippet** (max 10 lines):
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

## PySpice

- **Programmatic/API interface**: Yes (Python module interfacing Ngspice and Xyce).
- **Example snippet** (max 10 lines):
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

## skidl

- **Programmatic/API interface**: Yes (Python module for compact circuit description and netlist generation).
- **Example snippet** (max 10 lines):
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

## lcapy

- **Programmatic/API interface**: Yes (Python package for symbolic linear circuit analysis).
- **Example snippet** (max 10 lines):
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

## Other EDA SDKs

- **ngspice**
  - Programmatic/API interface: Yes (via PySpice `NgSpiceShared` Python wrapper and direct C API).
  - Example snippet (max 10 lines):
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
  - Programmatic/API interface: Yes (C++ embedded simulator API).
  - Example snippet (max 10 lines):
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
  - Programmatic/API interface: Yes (via PyLTSpice Python toolchain).
  - Example snippet (max 10 lines):
    ```python
    from PyLTSpice import SimRunner, SpiceEditor

    runner = SimRunner(output_folder='./temp', verbose=True)
    netlist = SpiceEditor("circuit.net")
    runner.run(netlist)
    ```
  - Source: https://context7.com/nunobrum/pyltspice/llms.txt
  - Context7 library ID: `/nunobrum/pyltspice`

- **spicelib**
  - Programmatic/API interface: Yes (Python toolchain for batch SPICE simulation across LTspice, Ngspice, QSPICE, and Xyce).
  - Example snippet (max 10 lines):
    ```python
    @classmethod
    def run(cls, netlist_file, cmd_line_switches=None, timeout=None,
            stdout=None, stderr=None, cwd=None, exe_log=False):
        cmd_run = cls.spice_exe + ['-Run'] + ['-b'] + [netlist_file] + cmd_line_switches
        return run_function(cmd_run, timeout=timeout, stdout=stdout, stderr=stderr, cwd=cwd)
    ```
  - Source: https://github.com/nunobrum/spicelib/blob/main/doc/classes/simulator_sim.md
  - Context7 library ID: `/nunobrum/spicelib`

- **Qucs**
  - Did not resolve to a relevant circuit/EDA library in Context7 (search returned unrelated web-framework results). Skipped.


## Playwright

- **Intercept WebSocket messages**: Use `BrowserContext.routeWebSocket()` or `Page.routeWebSocket()` with a `WebSocketRoute` handler to inspect, block, or modify messages before they reach the server.
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

- **Evaluate JavaScript in page context**: `page.evaluate()` runs code in the browser and returns serializable results; supports passing arguments and auto-awaiting Promises.
  ```javascript
  const result = await page.evaluate(([x, y]) => {
    return Promise.resolve(x * y);
  }, [7, 8]);
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

- **Handle iframe navigation and interaction**: Use `page.frameLocator(selector)` to target an iframe and chain locators; `contentFrame()` converts a standard locator into a frame locator for nested frames.
  ```javascript
  await page.frameLocator('#my-iframe')
    .getByRole('button', { name: 'Submit' }).click();
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

- **Persist cookies and session state**: `context.storageState()` saves cookies, localStorage, and IndexedDB to a file; restore by passing `storageState` to `browser.newContext()`.
  ```python
  storage = await context.storage_state(path="state.json")
  context = await browser.new_context(storage_state="state.json")
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/auth.md

- **Avoid bot detection / automation flags**: Use `Page.addLocatorHandler()` to dismiss unexpected pop-up overlays; block service workers via `serviceWorkers: 'BLOCK'` in context options.
  ```javascript
  await page.addLocatorHandler(
    page.getByText('Sign up to the newsletter'),
    async () => await page.getByRole('button', { name: 'No thanks' }).click()
  );
  ```
  - Source: https://github.com/microsoft/playwright/blob/main/docs/src/api/class-page.md

## Puppeteer

- **Intercept WebSocket messages**: Puppeteer core does not expose a dedicated WebSocket interception API; use CDP directly or fall back to `page.setRequestInterception(true)` for HTTP-level monitoring.
  ```javascript
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (!req.isInterceptResolutionHandled()) req.continue();
  });
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **Evaluate JavaScript in page context**: `page.evaluate()` runs a function or string expression inside the browser; supports arguments, Promises, and `evaluateHandle()` for DOM node references.
  ```javascript
  const title = await page.evaluate(() => document.title);
  const sum = await page.evaluate((a, b) => a + b, 10, 20);
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **Handle iframe navigation and interaction**: Access frames via `page.frames()` or `page.waitForFrame()`, then use `frame.evaluate()`, `frame.click()`, and `frame.waitForNavigation()`; wrap click+navigate in `Promise.all` to avoid races.
  ```javascript
  const [response] = await Promise.all([
    frame.waitForNavigation(),
    frame.click('a.my-link'),
  ]);
  ```
  - Source: https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.frame.waitfornavigation.md

- **Persist cookies and session state**: Use `browser.setCookie()`, `browser.cookies()`, and `browser.deleteCookie()` to pre-seed or restore session state before navigation; isolated contexts via `browser.createBrowserContext()`.
  ```javascript
  await browser.setCookie({
    name: 'session_token', value: 'abc123',
    domain: 'example.com', path: '/', httpOnly: true, secure: true
  });
  ```
  - Source: https://context7.com/puppeteer/puppeteer/llms.txt

- **Avoid bot detection / automation flags**: Context7 core docs do not cover stealth plugins; returned results focus on disabling Chrome features and request interception rather than masking `navigator.webdriver`.
  ```javascript
  const browser = await puppeteer.launch({
    args: ['--disable-features=HttpsFirstBalancedModeAutoEnable'],
  });
  ```
  - Source: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
