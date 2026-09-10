/**
 * C++ Professional Developer Certification - 15 Hardest Questions
 * This file contains the most challenging C++ questions for certification
 */

export interface CPPMCQQuestion {
  id: string;
  section: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CPPCodingQuestion {
  id: string;
  section: string;
  type: 'coding';
  question: string;
  functionName: string;
  testCases: string;
  solution: string;
  explanation: string;
}

export type CPPQuestion = CPPMCQQuestion | CPPCodingQuestion;

// Section 1: Memory Management and RAII
export const cppHardQuestions: CPPQuestion[] = [
  // Question 1 - MCQ: Smart Pointer Semantics
  {
    id: 'cpp-hq-1',
    section: 'Section 1: Memory Management and RAII',
    type: 'mcq',
    question: `What is the output of the following code involving shared_ptr and custom deleters?`,
    options: [
      'A) Prints "Creating" twice, "Deleting" twice',
      'B) Prints "Creating" twice, "Deleting" once',
      'C) Prints "Creating" once, "Deleting" twice',
      'D) Prints "Creating" once, "Deleting" once'
    ],
    correctAnswer: 'B',
    explanation: `shared_ptr with custom deleter uses reference counting. When the first shared_ptr goes out of scope, count drops to 1 (not 0), so deleter is not called. Only when the second shared_ptr goes out of scope, count reaches 0 and deleter is called exactly once.`
  },
  // Question 2 - Coding: Custom Allocator
  {
    id: 'cpp-hq-2',
    section: 'Section 1: Memory Management and RAII',
    type: 'coding',
    question: `Implement a thread-safe pool allocator that pre-allocates memory blocks and serves allocation requests in O(1) time.`,
    functionName: 'PoolAllocator',
    testCases: `PoolAllocator<int, 10> pool;
int* p1 = pool.allocate();
int* p2 = pool.allocate();
*pool.allocate() = 42;`,
    solution: `template<typename T, std::size_t N>
class PoolAllocator {
private:
    union Block {
        char data[sizeof(T)];
        Block* next;
    };
    
    Block* head_;
    std::mutex mutex_;
    std::vector<Block> blocks_;
    
public:
    PoolAllocator() : head_(nullptr) {
        blocks_.resize(N);
        for (std::size_t i = 0; i < N; ++i) {
            blocks_[i].next = (i < N - 1) ? &blocks_[i + 1] : nullptr;
        }
        head_ = &blocks_[0];
    }
    
    T* allocate() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (!head_) {
            throw std::bad_alloc();
        }
        Block* block = head_;
        head_ = block->next;
        return reinterpret_cast<T*>(block->data);
    }
    
    void deallocate(T* ptr) {
        std::lock_guard<std::mutex> lock(mutex_);
        Block* block = reinterpret_cast<Block*>(ptr);
        block->next = head_;
        head_ = block;
    }
};`,
    explanation: `This pool allocator pre-allocates N blocks at construction and maintains a free list. Allocation takes O(1) by popping from the free list, and deallocation O(1) by pushing back. Thread safety is ensured with mutex.`
  },
  // Question 3 - MCQ: Placement New
  {
    id: 'cpp-hq-3',
    section: 'Section 1: Memory Management and RAII',
    type: 'mcq',
    question: `What is the correct way to use placement new to construct an object in pre-allocated memory?`,
    options: [
      'A) new (ptr) MyClass(args...) - but need to explicitly call destructor',
      'B) new (ptr) MyClass(args...) - destructor called automatically',
      'C) MyClass* p = new MyClass(args...); p->~MyClass();',
      'D) std::construct_at(ptr, args...)'
    ],
    correctAnswer: 'A',
    explanation: `Placement new constructs an object in existing memory but does NOT automatically call the destructor. You MUST explicitly call the destructor before reusing the memory: ptr->~MyClass(). In C++20, std::construct_at is preferred.`
  },
  // Question 4 - Coding: RAII Wrapper
  {
    id: 'cpp-hq-4',
    section: 'Section 1: Memory Management and RAII',
    type: 'coding',
    question: `Implement a scope guard that executes cleanup code when going out of scope, with optional commit/rollback semantics.`,
    functionName: 'ScopeGuard',
    testCases: `auto guard = make_scope_guard([] { std::cout << "Cleanup!\\n"; });
// Outputs "Cleanup!" when guard goes out of scope`,
    solution: `template<typename F>
class ScopeGuard {
private:
    F cleanup_;
    bool committed_;
    
public:
    explicit ScopeGuard(F&& cleanup) 
        : cleanup_(std::forward<F>(cleanup)), committed_(false) {}
    
    ~ScopeGuard() {
        if (!committed_) {
            cleanup_();
        }
    }
    
    void commit() { committed_ = true; }
    
    ScopeGuard(const ScopeGuard&) = delete;
    ScopeGuard& operator=(const ScopeGuard&) = delete;
    
    ScopeGuard(ScopeGuard&& other) noexcept 
        : cleanup_(std::move(other.cleanup_)), 
          committed_(other.committed_) {
        other.committed_ = true;
    }
};

template<typename F>
ScopeGuard<F> make_scope_guard(F&& cleanup) {
    return ScopeGuard<F>(std::forward<F>(cleanup));
}`,
    explanation: `This RAII scope guard executes cleanup on destruction unless commit() is called. The move constructor sets the source to committed=true to prevent double cleanup. This pattern is useful for transaction-style operations.`
  },
  // Question 5 - MCQ: Unique Pointer
  {
    id: 'cpp-hq-5',
    section: 'Section 1: Memory Management and RAII',
    type: 'mcq',
    question: `Which unique_ptr operation has the potential to cause undefined behavior?`,
    options: [
      'A) std::unique_ptr<T> p(new T()); p.reset();',
      'B) std::unique_ptr<T[]> p(new T[10]); delete[] p.release();',
      'C) std::unique_ptr<T> p1, p2; p1 = std::move(p2);',
      'D) std::unique_ptr<T, Deleter> p(new T(), customDeleter);'
    ],
    correctAnswer: 'B',
    explanation: `Using release() on a unique_ptr<T[]> gives a raw pointer to the array. Calling delete[] on it is correct but error-prone. However, calling plain delete on it (not delete[]) causes undefined behavior. The proper way is to let unique_ptr handle deletion or use get_deleter().`
  },
  // Question 6 - Coding: Observer Pattern
  {
    id: 'cpp-hq-6',
    section: 'Section 2: Design Patterns and Modern C++',
    type: 'coding',
    question: `Implement a thread-safe observer pattern using modern C++ with variadic templates.`,
    functionName: 'Observable',
    testCases: `Observable<Events> events;
events.subscribe([](auto e) { std::cout << "Received\\n"; });
events.notify(EventType::Test);`,
    solution: `enum class EventType { Test, Data, Error };

struct Events {
    EventType type;
    std::string data;
};

template<typename... Args>
class Observable {
private:
    std::vector<std::function<void(Args...)>> observers_;
    mutable std::mutex mutex_;
    
public:
    void subscribe(std::function<void(Args...)> observer) {
        std::lock_guard<std::mutex> lock(mutex_);
        observers_.push_back(std::move(observer));
    }
    
    void unsubscribe() {
        std::lock_guard<std::mutex> lock(mutex_);
        observers_.clear();
    }
    
    void notify(Args... args) const {
        std::vector<std::function<void(Args...)>> observers;
        {
            std::lock_guard<std::mutex> lock(mutex_);
            observers = observers_;
        }
        for (const auto& obs : observers) {
            obs(args...);
        }
    }
};`,
    explanation: `This implementation uses std::function for type-erased observers and mutex for thread safety. The copy in notify() prevents holding lock during observer execution, avoiding potential deadlocks.`
  },
  // Question 7 - MCQ: CRTP Pattern
  {
    id: 'cpp-hq-7',
    section: 'Section 2: Design Patterns and Modern C++',
    type: 'mcq',
    question: `What does CRTP stand for and what is its primary use in C++?`,
    options: [
      'A) Curiously Recurring Template Pattern - for compile-time polymorphism',
      'B) Curiously Recurring Template Pattern - for runtime polymorphism',
      'C) Constant Return Type Polymorphism - for type safety',
      'D) Composite Runtime Template Pattern - for code generation'
    ],
    correctAnswer: 'A',
    explanation: `CRTP (Curiously Recurring Template Pattern) enables compile-time polymorphism without virtual function overhead. The derived class passes itself as a template parameter to the base class, allowing static dispatch and potential optimization.`
  },
  // Question 8 - Coding: Template Metaprogramming
  {
    id: 'cpp-hq-8',
    section: 'Section 2: Design Patterns and Modern C++',
    type: 'coding',
    question: `Implement a type list and corresponding operations using template metaprogramming.`,
    functionName: 'TypeList',
    testCases: `using Types = TypeList<int, double, std::string>;
using Size = TypeListSize<Types>::value; // Should be 3
using Head = TypeListHead<Types>::type; // Should be int
using Tail = TypeListTail<Types>::type; // Should be TypeList<double, std::string>`,
    solution: `// Type list definition
template<typename... Ts>
struct TypeList {};

template<typename List>
struct TypeListSize;

template<typename... Ts>
struct TypeListSize<TypeList<Ts...>> {
    static constexpr std::size_t value = sizeof...(Ts);
};

template<typename List>
struct TypeListHead;

template<typename H, typename... Ts>
struct TypeListHead<TypeList<H, Ts...>> {
    using type = H;
};

template<typename List>
struct TypeListTail;

template<typename H, typename... Ts>
struct TypeListTail<TypeList<H, Ts...>> {
    using type = TypeList<Ts...>;
};

template<typename List, typename T>
struct TypeListPushBack;

template<typename T, typename... Ts>
struct TypeListPushBack<TypeList<Ts...>, T> {
    using type = TypeList<Ts..., T>;
};`,
    explanation: `This type list implementation provides compile-time operations on types. Each operation is a separate template struct that extracts or manipulates type information at compile time, enabling compile-time type computations.`
  },
  // Question 9 - MCQ: Perfect Forwarding
  {
    id: 'cpp-hq-9',
    section: 'Section 3: Move Semantics and Perfect Forwarding',
    type: 'mcq',
    question: `What is the purpose of std::forward in perfect forwarding?`,
    options: [
      'A) To move lvalues as lvalues and rvalues as rvalues',
      'B) To move lvalues as rvalues and preserve rvalue-ness',
      'C) To convert all arguments to rvalues',
      'D) To prevent copying of arguments'
    ],
    correctAnswer: 'B',
    explanation: `std::forward<T>(arg) casts an rvalue reference to an rvalue (so move constructor is invoked) and an lvalue reference to an lvalue (copy constructor). This preserves the value category of the original argument through the forwarding function.`
  },
  // Question 10 - Coding: Variadic Template
  {
    id: 'cpp-hq-10',
    section: 'Section 3: Move Semantics and Perfect Forwarding',
    type: 'coding',
    question: `Implement a function that can accept any number of arguments of any type and print them with their types.`,
    functionName: 'print_all',
    testCases: `print_all(1, 2.5, "hello", std::string("world"));
// Should print type and value for each argument`,
    solution: `#include <iostream>
#include <typeinfo>
#include <string>

void print_all() {
    // Base case - do nothing
}

template<typename T, typename... Args>
void print_all(T&& first, Args&&... rest) {
    std::cout << "Type: " << typeid(first).name() 
              << " Value: " << first << std::endl;
    if constexpr (sizeof...(rest) > 0) {
        print_all(std::forward<Args>(rest)...);
    }
}

// Alternative using fold expression (C++17)
template<typename... Args>
void print_all_fold(Args&&... args) {
    ((std::cout << typeid(Args).name() << ": " << args << "\\n"), ...);
}`,
    explanation: `This variadic template implementation uses recursive template instantiation with base case. The if constexpr (C++17) ensures compile-time branch elimination. The fold expression version provides a more concise C++17 alternative.`
  },
  // Question 11 - MCQ: Copy Elision
  {
    id: 'cpp-hq-11',
    section: 'Section 3: Move Semantics and Perfect Forwarding',
    type: 'mcq',
    question: `In C++17, which copy/move operations are guaranteed to be elided?`,
    options: [
      'A) Return value optimization (RVO) and Named RVO (NRVO)',
      'B) Only RVO, not NRVO',
      'C) Both RVO and NRVO are guaranteed',
      'D) No copy/move elision is guaranteed'
    ],
    correctAnswer: 'B',
    explanation: `C++17 mandates copy elision for prvalue returns (RVO) but not for named return value optimization (NRVO). Returning a local variable by value may still invoke copy/move constructor if elision doesn't occur.`
  },
  // Question 12 - Coding: Concurrent Data Structure
  {
    id: 'cpp-hq-12',
    section: 'Section 4: Concurrency and Multithreading',
    type: 'coding',
    question: `Implement a thread-safe ring buffer (circular buffer) with single producer single consumer pattern using std::atomic.`,
    functionName: 'RingBuffer',
    testCases: `RingBuffer<int, 1024> buffer;
buffer.push(42);
auto val = buffer.pop();
assert(val == 42);`,
    solution: `template<typename T, std::size_t N>
class RingBuffer {
private:
    alignas(64) T buffer_[N];
    std::atomic<std::size_t> write_idx_{0};
    std::atomic<std::size_t> read_idx_{0};
    
public:
    bool push(T&& value) {
        auto write = write_idx_.load(std::memory_order_relaxed);
        auto next_write = (write + 1) % N;
        
        if (next_write == read_idx_.load(std::memory_order_acquire)) {
            return false; // Buffer full
        }
        
        buffer_[write] = std::move(value);
        write_idx_.store(next_write, std::memory_order_release);
        return true;
    }
    
    std::optional<T> pop() {
        auto read = read_idx_.load(std::memory_order_relaxed);
        
        if (read == write_idx_.load(std::memory_order_acquire)) {
            return std::nullopt; // Buffer empty
        }
        
        auto value = std::move(buffer_[read]);
        read_idx_.store((read + 1) % N, std::memory_order_release);
        return value;
    }
    
    bool empty() const {
        return read_idx_.load(std::memory_order_acquire) == 
               write_idx_.load(std::memory_order_acquire);
    }
};`,
    explanation: `This lock-free ring buffer uses atomic indices for thread-safe SPSC (single producer single consumer) operations. The aligned memory (alignas(64)) prevents false sharing. Memory ordering is optimized for performance.`
  },
  // Question 13 - MCQ: std::atomic
  {
    id: 'cpp-hq-13',
    section: 'Section 4: Concurrency and Multithreading',
    type: 'mcq',
    question: `What is the difference between std::memory_order_seq_cst and std::memory_order_acq_rel?`,
    options: [
      'A) seq_cst provides total ordering, acq_rel provides release-acquire synchronization',
      'B) They are equivalent in behavior',
      'C) acq_rel is stronger than seq_cst',
      'D) seq_cst only works on x86 architecture'
    ],
    correctAnswer: 'A',
    explanation: `seq_cst provides the strongest ordering guarantee (total ordering across all threads). acq_rel provides release semantics on write and acquire semantics on read, sufficient for producer-consumer patterns but less strict than seq_cst.`
  },
  // Question 14 - Coding: STL Internals
  {
    id: 'cpp-hq-14',
    section: 'Section 5: STL and Performance Optimization',
    type: 'coding',
    question: `Implement a custom vector that implements small buffer optimization (SSO) and capacity management.`,
    functionName: 'SmallVector',
    testCases: `SmallVector<int, 4> vec;
for (int i = 0; i < 10; ++i) vec.push_back(i);
assert(vec.size() == 10);`,
    solution: `template<typename T, std::size_t N>
class SmallVector {
private:
    union Storage {
        T* heap_ptr;
        alignas(T) char inline_data[sizeof(T) * N];
    };
    
    Storage storage_;
    std::size_t size_{0};
    std::size_t capacity_{0};
    bool is_heap_{false};
    
    void* data() { return is_heap_ ? storage_.heap_ptr : storage_.inline_data; }
    
    void grow() {
        std::size_t new_cap = capacity_ == 0 ? 1 : capacity_ * 2;
        T* new_data = static_cast<T*>(::operator new(new_cap * sizeof(T)));
        
        std::uninitialized_move_n(static_cast<T*>(data()), size_, new_data);
        
        if (is_heap_) ::operator delete(storage_.heap_ptr);
        
        storage_.heap_ptr = new_data;
        capacity_ = new_cap;
        is_heap_ = true;
    }
    
public:
    SmallVector() : capacity_(0), is_heap_(false) {}
    
    ~SmallVector() {
        std::destroy_n(static_cast<T*>(data()), size_);
        if (is_heap_) ::operator delete(storage_.heap_ptr);
    }
    
    void push_back(const T& value) {
        if (size_ == capacity_) grow();
        new (static_cast<T*>(data()) + size_) T(value);
        ++size_;
    }
    
    void push_back(T&& value) {
        if (size_ == capacity_) grow();
        new (static_cast<T*>(data()) + size_) T(std::move(value));
        ++size_;
    }
    
    std::size_t size() const { return size_; }
    T* begin() { return static_cast<T*>(data()); }
    T* end() { return begin() + size_; }
};`,
    explanation: `This SmallVector uses union to store either inline buffer or heap pointer. The grow() function doubles capacity and moves existing elements. The union approach enables SSO (small string optimization) for the vector itself.`
  },
  // Question 15 - MCQ: Exception Safety
  {
    id: 'cpp-hq-15',
    section: 'Section 6: Exception Safety and Modern C++20',
    type: 'mcq',
    question: `Which exception safety guarantee does std::vector::push_back provide?`,
    options: [
      'A) No guarantee - may throw and corrupt vector',
      'B) Basic guarantee - strong if no reallocation needed',
      'C) Nothrow guarantee',
      'D) Strong guarantee always'
    ],
    correctAnswer: 'B',
    explanation: `std::vector::push_back provides basic exception safety. If reallocation occurs and copy/move constructor throws, the vector remains unchanged. If no reallocation needed and the copy/move throws, the vector may be in an indeterminate state but no resources are leaked (basic guarantee).`
  }
];

// Scoring guide for the certification
export const cppCertificationScoring = {
  totalQuestions: 15,
  passingScore: 85,
  sections: [
    { name: 'Memory Management and RAII', questions: 5 },
    { name: 'Design Patterns and Modern C++', questions: 3 },
    { name: 'Move Semantics and Perfect Forwarding', questions: 3 },
    { name: 'Concurrency and Multithreading', questions: 2 },
    { name: 'STL and Performance Optimization', questions: 1 },
    { name: 'Exception Safety and Modern C++20', questions: 1 }
  ],
  scoringGuide: {
    expert: { correct: '12-15', level: 'Expert Level (95%+ marks)' },
    advanced: { correct: '10-11', level: 'Advanced Level (85-94% marks)' },
    intermediate: { correct: '8-9', level: 'Intermediate Level (75-84% marks)' },
    needsImprovement: { correct: 'Below 8', level: 'Needs improvement' }
  }
};

// Export for easy importing
export default cppHardQuestions;

