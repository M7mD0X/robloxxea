import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

/**
 * Tab 3 — Scripting Docs & Guides
 *
 * Three real, technically accurate articles covering:
 *   1. Advanced Luau Fundamentals & Functions
 *   2. Working with Metatables and Hooking
 *   3. Using Remote Spies and manipulating RemoteEvents
 *
 * The articles are stored in plain TSX with <CodeBlock> components for any
 * code. Each article is collapsible on mobile so the page reads cleanly.
 */

type ArticleId = 'luau-fundamentals' | 'metatables-hooking' | 'remote-spies';

interface Article {
  id: ArticleId;
  title: string;
  subtitle: string;
  readTime: string;
  render: () => JSX.Element;
}

const ARTICLES: Article[] = [
  {
    id: 'luau-fundamentals',
    title: 'Advanced Luau Fundamentals & Functions',
    subtitle: 'Closures, varargs, type annotations, and the patterns that make scripts scale.',
    readTime: '~8 min read',
    render: () => <LuauFundamentalsArticle />
  },
  {
    id: 'metatables-hooking',
    title: 'Working with Metatables and Hooking',
    subtitle: 'Index metamethods, __index chains, and how to safely hook functions without breaking the game.',
    readTime: '~10 min read',
    render: () => <MetatablesArticle />
  },
  {
    id: 'remote-spies',
    title: 'Using Remote Spies & Manipulating RemoteEvents',
    subtitle: 'Capture, decode, replay, and forge RemoteEvent / RemoteFunction traffic between client and server.',
    readTime: '~9 min read',
    render: () => <RemoteSpyArticle />
  }
];

export default function Docs() {
  const [activeId, setActiveId] = useState<ArticleId | null>(null);
  const active = ARTICLES.find((a) => a.id === activeId) ?? null;

  if (active) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveId(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neon-cyan"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All articles
        </button>

        <article className="card p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-neon-purple">
            {active.readTime}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-50">{active.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{active.subtitle}</p>

          <div className="prose-docs mt-6">{active.render()}</div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neon-green/20 bg-gradient-to-br from-neon-green/10 via-void-700/40 to-neon-cyan/10 p-4">
        <h2 className="text-lg font-bold text-slate-50">Docs & Guides</h2>
        <p className="mt-1 text-sm text-slate-300">
          Real, code-first lessons for writing advanced Roblox scripts. Tap any card to read the full article.
        </p>
      </section>

      <ul className="space-y-3">
        {ARTICLES.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setActiveId(a.id)}
              className="card flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-neon-cyan/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 font-mono text-sm font-bold text-neon-cyan">
                {String(ARTICLES.indexOf(a) + 1).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-50">{a.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{a.subtitle}</p>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  {a.readTime}
                </p>
              </div>
              <svg className="text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   ARTICLE 1 — Advanced Luau Fundamentals & Functions
   ========================================================= */
function LuauFundamentalsArticle() {
  return (
    <>
      <p>
        Luau is Roblox's dialect of Lua 5.1, extended with a gradual type system, an ahead-of-time
        bytecode compiler, and sandboxing. Understanding the differences between stock Lua and Luau
        — and mastering first-class functions — is the difference between scripts that survive a
        game update and scripts that break every Tuesday.
      </p>

      <h2>1. First-class functions &amp; closures</h2>
      <p>
        Functions in Luau are values. You can store them in tables, pass them as arguments, return
        them, and — most importantly — capture the local variables of the enclosing scope. The
        captured variables form an <strong>upvalue</strong> set, and the function-plus-upvalues pair
        is called a <strong>closure</strong>. Closures are how you build stateful callbacks without
        global variables.
      </p>

      <CodeBlock
        caption="counter.lua"
        code={`-- A factory that returns a fresh counter closure.
local function makeCounter(start: number, step: number)
  local current = start -- this local is the upvalue
  return function()
    current += step
    return current
  end
end

local nextByTen = makeCounter(0, 10)
print(nextByTen()) -- 10
print(nextByTen()) -- 20
print(nextByTen()) -- 30`}
      />

      <p>
        Each call to <code>makeCounter</code> creates a brand-new <code>current</code> upvalue, so
        every returned counter is independent. This is the foundation of event handlers, iterator
        functions, and most exploit-script UI systems — whenever you see a function returned from
        another function, assume a closure is at work.
      </p>

      <h2>2. Varargs with <code>...</code> and <code>select</code></h2>
      <p>
        Luau inherits Lua 5.1's vararg syntax. A function declared with <code>...</code> as the last
        parameter accepts any number of arguments. You can pack them into a table with
        <code>{`local args = { ... }`}</code>, count them with <code>select('#', ...)</code>, or
        slice them with <code>select(n, ...)</code>.
      </p>

      <CodeBlock
        caption="varargs.lua"
        code={`local function logEvent(event: string, ...)
  local count = select('#', ...) -- number of varargs (handles nil holes!)
  local args = table.create(count)
  for i = 1, count do
    args[i] = select(i, ...)
  end
  print(('[%s] %d args'):format(event, count))
end

logEvent('RemoteFired', 'Attack', workspace.Boss, 42, nil, true)`}
      />

      <p>
        Always use <code>{`select('#', ...)`}</code> to count varargs. The <code>{`{...}`}</code> form
        silently truncates at the first <code>nil</code>, which is a common source of bugs when
        forwarding RemoteEvent arguments that may legitimately contain <code>nil</code>.
      </p>

      <h2>3. Luau type annotations</h2>
      <p>
        Luau ships a gradual type system that you opt into with <code>--!strict</code>,
        <code>--!nonstrict</code>, or <code>--!strict</code> at the top of a script. Types buy you
        autocomplete in Studio, runtime-free static checks, and self-documenting APIs. They are
        erased at runtime, so they cost zero performance.
      </p>

      <CodeBlock
        caption="types.lua"
        code={`--!strict

-- Type alias
type Vector = { x: number, y: number, z: number }

-- Function signature with parameter and return types
local function add(a: Vector, b: Vector): Vector
  return { x = a.x + b.x, y = a.y + b.y, z = a.z + b.z }
end

-- Optional and union types
type Maybe<T> = T | nil
local function findPlayer(name: string): Maybe<Player>
  for _, p in ipairs(game.Players:GetPlayers()) do
    if p.Name == name then return p end
  end
  return nil
end

-- Function types as values
type Callback = (player: Player) -> ()
local onJoin: Callback = function(p: Player)
  print(p.Name .. ' joined')
end`}
      />

      <h2>4. <code>task</code> library over <code>spawn</code> / <code>wait</code></h2>
      <p>
        The legacy <code>spawn</code>, <code>delay</code>, and <code>wait</code> globals are
        deprecated — they run on Roblox's old task scheduler, which has throttling and ordering
        quirks. Always use the <code>task</code> library instead. It runs on the modern scheduler,
        yields predictably, and integrates cleanly with <code>Cancel()</code>.
      </p>

      <CodeBlock
        caption="task.lua"
        code={`-- BAD: legacy, throttled, hard to cancel
spawn(function()
  while true do
    wait(1)
    print('tick')
  end
end)

-- GOOD: modern scheduler, cancellable
local loop = task.spawn(function()
  while true do
    task.wait(1)
    print('tick')
  end
end)

-- Cancel after 10s
task.delay(10, function()
  -- task.cancel works on the thread returned by task.spawn
  pcall(function() task.cancel(loop) end)
end)`}
      />

      <h2>5. Pattern: rate-limited event handler</h2>
      <p>
        Putting it all together — here's a closure-based, type-annotated, rate-limited event handler
        that debounces a RemoteEvent. This is the exact pattern you'll use in any feature script
        that reacts to player input or remote traffic.
      </p>

      <CodeBlock
        caption="debounce.lua"
        code={`--!strict
local Players = game:GetService('Players')
local ReplicatedStorage = game:GetService('ReplicatedStorage')

local fireRemote: RemoteEvent = ReplicatedStorage:WaitForChild('FireWeapon')

local function makeDebounced(callback: (...any) -> (), cooldown: number): (...any) -> ()
  local lastFire = 0
  return function(...)
    local now = os.clock()
    if now - lastFire < cooldown then return end
    lastFire = now
    callback(...)
  end
end

local onFire = makeDebounced(function(player: Player, target: Vector3)
  print(('%s fired at %s'):format(player.Name, tostring(target)))
end, 0.1) -- 10 rounds per second max

fireRemote.OnServerEvent:Connect(onFire)`}
      />

      <h3>Key takeaways</h3>
      <ul>
        <li>Treat functions as values; closures are your state machine.</li>
        <li>Use <code>select('#', ...)</code> for safe vararg counting.</li>
        <li>Add <code>--!strict</code> and explicit types to every new script — it pays back tenfold.</li>
        <li>Replace every <code>spawn</code>/<code>wait</code> with <code>task.spawn</code>/<code>task.wait</code>.</li>
      </ul>
    </>
  );
}

/* =========================================================
   ARTICLE 2 — Metatables & Hooking
   ========================================================= */
function MetatablesArticle() {
  return (
    <>
      <p>
        A <strong>metatable</strong> is a table attached to another table that defines how that
        table behaves under standard operations — indexing, arithmetic, comparison, equality, and
        iteration. Metatables power Roblox's object system under the hood, and they're also the
        cleanest tool for intercepting and replacing function behavior ("hooking").
      </p>

      <h2>1. The metamethod cheat sheet</h2>
      <ul>
        <li><code>__index</code> — fired when reading a missing key. Can be a table (fallback) or a function.</li>
        <li><code>__newindex</code> — fired when <em>writing</em> a key that doesn't yet exist.</li>
        <li><code>__call</code> — fired when the table itself is called like a function.</li>
        <li><code>__tostring</code> — fired by <code>tostring()</code> and <code>print()</code>.</li>
        <li><code>__eq</code>, <code>__lt</code>, <code>__le</code> — comparison operators.</li>
        <li><code>__add</code>, <code>__sub</code>, <code>__mul</code>, … — arithmetic operators.</li>
        <li><code>__iter</code> — Luau-specific; custom iteration for <code>for k, v in t</code>.</li>
      </ul>

      <h2>2. Building a class with <code>__index</code></h2>
      <p>
        The canonical Roblox OOP pattern: set <code>__index</code> to the class table itself, then
        return a new table from the constructor. Reads on the instance fall through to the class
        table, so methods are shared across all instances without duplication.
      </p>

      <CodeBlock
        caption="class.lua"
        code={`local Pet = {}
Pet.__index = Pet

function Pet.new(name: string, sound: string)
  local self = setmetatable({}, Pet)
  self.name = name
  self.sound = sound
  return self
end

function Pet:speak()
  print(self.name .. ' says ' .. self.sound)
end

local dog = Pet.new('Rex', 'Woof')
local cat = Pet.new('Mittens', 'Meow')
dog:speak()  -- Rex says Woof
cat:speak()  -- Mittens says Meow

-- __index fallthrough means methods resolve on the class table,
-- not on each instance. One function, shared by every Pet.`}
      />

      <h2>3. <code>__index</code> as a function — lazy properties</h2>
      <p>
        When <code>__index</code> is a function, Roblox calls it with the table and the missing key.
        This lets you compute expensive properties on first access and even cache them.
      </p>

      <CodeBlock
        caption="lazy.lua"
        code={`local config = setmetatable({}, {
  __index = function(t, k)
    if k == 'ServerTime' then
      local value = os.time()
      rawset(t, k, value) -- cache for next read
      return value
    end
    return nil
  end
})

print(config.ServerTime) -- computed once
print(config.ServerTime) -- served from cache`}
      />

      <h2>4. Protecting a table from tampering</h2>
      <p>
        Combine <code>__index</code> and <code>__newindex</code> with <code>rawget</code> /
        <code>rawset</code> to build a read-only proxy. Any write attempt triggers your handler —
        useful for guarding shared configuration tables from accidental mutation by other scripts.
      </p>

      <CodeBlock
        caption="readonly.lua"
        code={`local function readOnly(t: table): table
  return setmetatable({}, {
    __index = t,
    __newindex = function(_, k, _)
      error('Attempt to modify read-only table at key: ' .. tostring(k), 2)
    end,
    __metatable = 'locked' -- hides the real metatable from getmetatable()
  })
end

local secrets = readOnly({ apiKey = 'abc', region = 'eu' })
print(secrets.apiKey)      -- 'abc' (read works)
secrets.apiKey = 'hacked'  -- throws: read-only table`}
      />

      <h2>5. Hooking functions — the safe way</h2>
      <p>
        "Hooking" means replacing a function with your own wrapper that runs before, after, or
        instead of the original. In a vanilla Luau environment (no exploit API), you do this by
        reassigning the function reference. The trick is to <strong>always keep a reference to the
        original</strong> so your wrapper can call through, and so you can un-hook later.
      </p>

      <CodeBlock
        caption="hook.lua"
        code={`local Players = game:GetService('Players')

-- 1. Save the original
local originalKick = Players.Player.Kick

-- 2. Install the wrapper
Players.Player.Kick = function(self, reason: string?)
  warn('[Hook] Kick called on ' .. tostring(self) .. ' reason=' .. tostring(reason))
  -- Optionally block: return without calling original
  -- Or pass through:
  return originalKick(self, reason)
end

-- 3. To un-hook later:
-- Players.Player.Kick = originalKick`}
      />

      <h2>6. Hooking metamethods with <code>hookmetamethod</code> (exploit-only)</h2>
      <p>
        Most modern executors expose a <code>hookmetamethod</code> function that lets you intercept
        any metamethod on any table — including Roblox's internal instances. This is the technique
        used by anti-cheat bypasses and advanced remote spies. Use with care: hooking too broadly
        will crash the client.
      </p>

      <CodeBlock
        caption="hookmetamethod.lua"
        code={`-- Executor-only API; not available in vanilla Studio.
local originalIndex = hookmetamethod(game, '__index', function(self, k)
  -- Log every property read on every Instance in the DataModel.
  -- WARNING: this fires thousands of times per second. Filter aggressively.
  if typeof(self) == 'Instance' and typeof(k) == 'string' then
    if k:match('^Remote') then
      print(('[hook] %s.%s'):format(self:GetFullName(), k))
    end
  end
  return originalIndex(self, k)
end)`}
      />

      <h3>Key takeaways</h3>
      <ul>
        <li>Set <code>__index = ClassTable</code> to share methods across instances.</li>
        <li>Use function-valued <code>__index</code> for lazy or computed properties.</li>
        <li>Always keep a reference to the original function before hooking; never throw it away.</li>
        <li><code>hookmetamethod</code> is executor-only and very powerful — filter aggressively to avoid performance death.</li>
      </ul>
    </>
  );
}

/* =========================================================
   ARTICLE 3 — Remote Spies & RemoteEvent Manipulation
   ========================================================= */
function RemoteSpyArticle() {
  return (
    <>
      <p>
        Roblox games communicate between client and server using two instance types:
        <strong>RemoteEvents</strong> (fire-and-forget) and <strong>RemoteFunctions</strong>
        (request-response). Almost every gameplay action — firing a weapon, buying an item, claiming
        a reward — flows through a remote. Spying on that traffic is the single most useful skill
        for understanding how a game works and for writing automation that the server will accept.
      </p>

      <h2>1. The two remotes, side by side</h2>

      <CodeBlock
        caption="remotes.lua"
        code={`-- RemoteEvent: one-way (client -> server), no return value
local remote: RemoteEvent = ReplicatedStorage.WeaponFired
remote:FireServer(target)             -- client side
remote.OnServerEvent:Connect(function(player, target)
  -- server side: player is auto-filled by the engine
end)

-- RemoteFunction: round-trip, server can return a value
local rf: RemoteFunction = ReplicatedStorage.GetInventory
local items = rf:InvokeServer()       -- client side, yields until reply
rf.OnServerInvoke = function(player)
  return player.Inventory:GetChildren()
end`}
      />

      <h2>2. The minimal remote spy</h2>
      <p>
        A remote spy works by replacing the <code>FireServer</code> / <code>InvokeServer</code>
        methods on every RemoteEvent / RemoteFunction in the game with a wrapper that logs the call
        before forwarding it. The trick is to hook <strong>once</strong>, on the base class, so you
        catch every existing and future remote without having to enumerate them.
      </p>

      <CodeBlock
        caption="spy.lua"
        code={`--!strict
local ReplicatedStorage = game:GetService('ReplicatedStorage')

local function installSpy()
  -- Save originals
  local originalFire = Instance.new('RemoteEvent').FireServer
  local originalInvoke = Instance.new('RemoteFunction').InvokeServer

  local function logCall(remote: Instance, method: string, ...)
    local count = select('#', ...)
    local preview = {}
    for i = 1, count do
      local v = select(i, ...)
      preview[i] = typeof(v) == 'Instance' and v:GetFullName() or tostring(v)
    end
    print(('[SPY] %s:%s(%s)'):format(remote:GetFullName(), method, table.concat(preview, ', ')))
  end

  -- Hook the RemoteEvent class itself
  local mt = getrawmetatable(game:GetService('ReplicatedStorage'))
  -- (Executor environments also expose hookmetamethod; see article 2.)

  -- Direct method replacement — works in Studio too:
  local function hookRemote(remote: RemoteEvent)
    local original = remote.FireServer
    remote.FireServer = function(self, ...)
      logCall(self, 'FireServer', ...)
      return original(self, ...)
    end
  end

  -- Install on existing remotes + watch for new ones
  for _, desc in ipairs(ReplicatedStorage:GetDescendants()) do
    if desc:IsA('RemoteEvent') then hookRemote(desc) end
  end
  ReplicatedStorage.DescendantAdded:Connect(function(desc)
    if desc:IsA('RemoteEvent') then hookRemote(desc) end
  end)
end`}
      />

      <p>
        Note that this naive version only catches remotes directly inside
        <code>ReplicatedStorage</code>. Production spies (Hydroxide, SimpleSpy) walk
        <code>game:GetDescendants()</code> and re-scan on <code>ChildAdded</code> for every service.
      </p>

      <h2>3. Decoding arguments — types matter</h2>
      <p>
        Remote arguments are usually <em>not</em> plain strings. The table below shows what to
        expect and how to safely stringify each type. Getting this wrong is the #1 cause of spy
        output that shows <code>table: 0x...</code> instead of useful data.
      </p>

      <ul>
        <li><code>string</code>, <code>number</code>, <code>boolean</code> — print directly.</li>
        <li><code>Instance</code> — call <code>:GetFullName()</code> for the path.</li>
        <li><code>Vector3</code> / <code>CFrame</code> / <code>Color3</code> — use <code>tostring</code>, or pull <code>.X</code>, <code>.Y</code>, <code>.Z</code> for compact output.</li>
        <li><code>table</code> — iterate with <code>next</code>; if it has a <code>__tostring</code> metamethod, <code>tostring</code> will use it.</li>
        <li><code>nil</code> — print the literal string <code>"nil"</code>; never omit, or you lose count of args.</li>
      </ul>

      <CodeBlock
        caption="decode.lua"
        code={`local function describe(value: any): string
  local t = typeof(value)
  if t == 'Instance' then
    return value:GetFullName()
  elseif t == 'Vector3' then
    return ('Vec3(%.2f, %.2f, %.2f)'):format(value.X, value.Y, value.Z)
  elseif t == 'table' then
    local parts = {}
    for k, v in pairs(value) do
      parts[#parts + 1] = tostring(k) .. '=' .. describe(v)
    end
    return '{' .. table.concat(parts, ', ') .. '}'
  elseif t == 'nil' then
    return 'nil'
  else
    return tostring(value)
  end
end`}
      />

      <h2>4. Replaying &amp; forging calls</h2>
      <p>
        Once you've captured a remote call, you can replay it verbatim, or modify the arguments and
        send a forged call. This is how auto-farm scripts work: they observe one legitimate
        <code>FireServer</code>, then re-fire it on a timer with the same arguments.
      </p>

      <CodeBlock
        caption="replay.lua"
        code={`local captured = {
  remote = ReplicatedStorage:WaitForChild('ClaimReward'),
  args = { 'Daily' }
}

-- Replay once
captured.remote:FireServer(table.unpack(captured.args))

-- Replay on a loop with jitter (anti-AFK pattern)
task.spawn(function()
  while true do
    captured.remote:FireServer(table.unpack(captured.args))
    task.wait(60 + math.random(0, 5)) -- 60–65s
  end
end)`}
      />

      <h2>5. Blocking a remote</h2>
      <p>
        Sometimes you want to <em>stop</em> a remote from reaching the server — for example, blocking
        the "anti-cheat heartbeat" remote that some games use to detect auto-farmers. To do this,
        hook the remote and simply don't call through to the original.
      </p>

      <CodeBlock
        caption="block.lua"
        code={`local heartbeat = ReplicatedStorage:WaitForChild('AntiCheatHeartbeat')
local original = heartbeat.FireServer
heartbeat.FireServer = function(self, ...)
  -- Drop the call silently. Server never sees a heartbeat,
  -- which some servers treat as "client lagging" rather than "client cheating".
  return -- intentionally do NOT call original(self, ...)
end`}
      />

      <h2>6. Pitfalls &amp; good habits</h2>
      <ul>
        <li><strong>Always preserve argument count.</strong> Use <code>{`select('#', ...)`}</code> when forwarding, not <code>{`{...}`}</code>, or you'll truncate at the first <code>nil</code>.</li>
        <li><strong>Don't hook in loops.</strong> Re-hooking the same remote stacks wrappers and exponentially slows every call.</li>
        <li><strong>Filter aggressively.</strong> A spy that logs every remote call will produce megabytes of output in seconds. Match against <code>:GetFullName()</code> substrings.</li>
        <li><strong>Expect server-side validation.</strong> Forging a remote doesn't bypass server checks; it just submits the request. The server can still reject it.</li>
        <li><strong>Use a real spy for exploration.</strong> Hydroxide / SimpleSpy (in the Main Tools tab) handle all of the above for you. Reach for hand-written hooks only when you need surgical control.</li>
      </ul>
    </>
  );
}
